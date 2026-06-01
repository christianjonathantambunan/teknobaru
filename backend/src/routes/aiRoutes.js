const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

/**
 * POST /api/ai/recommend
 * Body: { message, conversationHistory }
 * 
 * Menggunakan Anthropic API untuk merekomendasikan menu kantin
 * berdasarkan preferensi user (mood, budget, selera, dll).
 */
router.post('/recommend', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Ambil semua tenant + menu yang tersedia dari database
    const tenants = await prisma.tenantProfile.findMany({
      where: { isOpen: true },
      include: {
        menuCategories: {
          include: {
            items: {
              where: { isAvailable: true }
            }
          }
        }
      }
    });

    // Format data menu sebagai konteks untuk AI
    const menuContext = tenants.map(tenant => {
      const allItems = tenant.menuCategories.flatMap(cat => cat.items);
      return {
        tenantId: tenant.id,
        storeName: tenant.storeName,
        description: tenant.description,
        items: allItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description
        }))
      };
    });

    const systemPrompt = `Kamu adalah asisten AI ramah di aplikasi kantin kampus bernama MEALQ. Tugasmu adalah membantu mahasiswa menemukan menu yang cocok berdasarkan preferensi mereka.

Berikut adalah daftar tenant dan menu yang tersedia saat ini:
${JSON.stringify(menuContext, null, 2)}

Panduan menjawab:
- Gunakan Bahasa Indonesia yang santai dan ramah (boleh pakai emoji)
- Jika user menyebut budget, rekomendasikan menu yang sesuai harga (dalam Rupiah)
- Jika user menyebut selera/mood, rekomendasikan menu yang cocok
- Selalu sertakan nama tenant, nama menu, dan harga dalam rekomendasimu
- Di akhir rekomendasimu, sertakan JSON dalam format berikut (jangan tampilkan ke user, tapi sertakan di response):
  [RECOMMENDATIONS_JSON]{"recommendations":[{"tenantId":"...","tenantName":"...","itemId":"...","itemName":"...","price":...}]}[/RECOMMENDATIONS_JSON]
- Batasi rekomendasi maksimal 3 item
- Jika tidak ada yang cocok atau user hanya ingin ngobrol, tetap respon dengan ramah tanpa JSON
- Jangan rekomendasikan menu yang tidak ada di daftar`;

    // Panggil Anthropic API
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          ...conversationHistory,
          { role: 'user', content: message }
        ]
      })
    });

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text();
      console.error('Anthropic API error:', errBody);
      return res.status(500).json({ error: 'AI service error', detail: errBody });
    }

    const aiData = await anthropicRes.json();
    const rawText = aiData.content[0]?.text || '';

    // Extract recommendations JSON jika ada
    let recommendations = null;
    let displayText = rawText;
    const jsonMatch = rawText.match(/\[RECOMMENDATIONS_JSON\]([\s\S]*?)\[\/RECOMMENDATIONS_JSON\]/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        recommendations = parsed.recommendations;
      } catch (e) {
        console.error('Failed to parse recommendations JSON:', e);
      }
      // Hapus JSON dari teks yang ditampilkan ke user
      displayText = rawText.replace(/\[RECOMMENDATIONS_JSON\][\s\S]*?\[\/RECOMMENDATIONS_JSON\]/g, '').trim();
    }

    res.json({
      reply: displayText,
      recommendations,
      updatedHistory: [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: rawText }
      ]
    });

  } catch (error) {
    console.error('AI route error:', error);
    res.status(500).json({ error: 'Failed to get AI recommendation', message: error.message });
  }
});

module.exports = router;
