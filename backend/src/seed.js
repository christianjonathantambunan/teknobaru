const prisma = require('./prisma');

async function main() {
  console.log('Seeding database...');

  // Create a mock student
  const student = await prisma.user.create({
    data: {
      email: 'student@example.com',
      password: 'password123',
      role: 'STUDENT',
      name: 'Budi Santoso',
    }
  });

  console.log('Created student:', student.name);

  const mockTenants = [
    {
      name: "Kedai Joni",
      description: "Menu sederhana dengan rasa mantap.",
      image: "https://allpointseast.com/wp-content/uploads/2019/05/IMG_2437-rs-1080x729.jpg",
      menus: [
        { name: "Nasi Goreng", price: 12000, description: "Nasi goreng dengan bumbu khas, disajikan hangat dengan telur.", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=200" },
        { name: "Ayam Geprek", price: 12000, description: "Ayam crispy digeprek dengan sambal pedas level bebas.", image: "https://farahjeats.com/wp-content/uploads/2026/01/indonesian-ayam-geprek-spicy-sauce-with-rice.jpeg" }
      ]
    },
    {
      name: "Kedai Kosim",
      description: "Spesialis mie dan bakso.",
      image: "https://i.gojekapi.com/darkroom/gofood-indonesia/v2/images/uploads/ebb30a19-b681-4ecd-9011-68ea488daa62_Go-Biz_20241215_192921.jpeg?auto=format",
      menus: [
        { name: "Mie Ayam", price: 12000, description: "Mie ayam dengan topping ayam manis gurih.", image: "https://assets.unileversolutions.com/recipes-v3/257956-default.jpg?im=AspectCrop=(720,459);Resize=(720,459)" },
        { name: "Bakso", price: 13000, description: "Bakso sapi kenyal dengan kuah kaldu hangat.", image: "https://assets.unileversolutions.com/recipes-v3/245281-default.jpg?im=AspectCrop=(720,459);Resize=(720,459)" }
      ]
    },
    {
      name: "Kedai Maranggi",
      description: "Sate dan minuman segar.",
      image: "https://rajominang.id/blog/uploads/images/202408/image_750x_66c17689225a7.jpg",
      menus: [
        { name: "Sate Ayam", price: 20000, description: "Sate ayam dengan bumbu kacang kental dan lontong.", image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=200" },
        { name: "Es Teh", price: 5000, description: "Es teh manis dingin, segar dan sederhana.", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=200" }
      ]
    },
    {
      name: "Kedai Japar",
      description: "Menu khas Indonesia.",
      image: "https://www.astronauts.id/blog/wp-content/uploads/2022/08/Makanan-Khas-Daerah-tiap-Provinsi-di-Indonesia-Serta-Daerah-Asalnya-1024x683.jpg",
      menus: [
        { name: "Ketoprak", price: 15000, description: "Ketoprak lengkap dengan tahu, lontong, dan saus kacang.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Ketoprak_Boplo.JPG/250px-Ketoprak_Boplo.JPG" },
        { name: "Gado Gado", price: 14000, description: "Sayuran segar dengan saus kacang khas Indonesia.", image: "https://www-recipetineats-com.translate.goog/tachyon/2020/06/Indonesian-Gado-Gado.jpg?resize=900,1260&zoom=0.72&_x_tr_sl=en&_x_tr_tl=id&_x_tr_hl=id&_x_tr_pto=imgs" }
      ]
    }
  ];

  for (let i = 0; i < mockTenants.length; i++) {
    const t = mockTenants[i];
    
    // Create Tenant User
    const user = await prisma.user.create({
      data: {
        email: `tenant${i+1}@example.com`,
        password: 'password123',
        role: 'TENANT',
        name: t.name,
      }
    });

    // Create Tenant Profile
    const profile = await prisma.tenantProfile.create({
      data: {
        userId: user.id,
        storeName: t.name,
        description: t.description,
        isOpen: true
      }
    });

    // Create Default Category
    const category = await prisma.menuCategory.create({
      data: {
        tenantId: profile.id,
        name: 'Menu Utama'
      }
    });

    // Create Menu Items
    for (const menu of t.menus) {
      await prisma.menuItem.create({
        data: {
          categoryId: category.id,
          name: menu.name,
          price: menu.price,
          description: menu.description,
          imageUrl: menu.image,
          isAvailable: true
        }
      });
    }
    console.log(`Created tenant: ${t.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
