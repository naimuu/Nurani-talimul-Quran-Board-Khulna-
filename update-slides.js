const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const s = await prisma.boardSettings.findFirst();
  if (!s) return;
  const slides = [
    {
      id: 'slide-1',
      imageUrl: '/images/hero/slide1.jpg',
      title: 'নূরানী বোর্ড খুলনায় স্বাগতম',
      subtitle: 'আধুনিক পদ্ধতির সাথে বিশুদ্ধ কোরআনি শিক্ষায় নতুন প্রজন্মকে ক্ষমতায়ন করা।',
      description: 'আধুনিক পদ্ধতির সাথে বিশুদ্ধ কোরআনি শিক্ষায় নতুন প্রজন্মকে ক্ষমতায়ন করা।',
      buttonText: 'আরও জানুন',
      buttonLink: '/about'
    },
    {
      id: 'slide-2',
      imageUrl: '/images/hero/slide2.jpg',
      title: 'আপনার মাদরাসা এখনই নিবন্ধন করুন',
      subtitle: 'নতুন মাদরাসাগুলির জন্য সহজ নিবন্ধন প্রক্রিয়া। অনুমোদন পান এবং আমাদের নির্দেশিকায় কাজ শুরু করুন।',
      description: 'নতুন মাদরাসাগুলির জন্য সহজ নিবন্ধন প্রক্রিয়া। অনুমোদন পান এবং আমাদের নির্দেশিকায় কাজ শুরু করুন।',
      buttonText: '',
      buttonLink: ''
    },
    {
      id: 'slide-3',
      imageUrl: '/images/hero/slide3.jpg',
      title: 'নূরানী মাদরাসার বই অর্ডার করুন',
      subtitle: 'নতুন শিক্ষাবর্ষের জন্য নূরানী মাদরাসার সকল বই এখন অনলাইনে অর্ডার করা যাচ্ছে।',
      description: 'নতুন শিক্ষাবর্ষের জন্য নূরানী মাদরাসার সকল বই এখন অনলাইনে অর্ডার করা যাচ্ছে।',
      buttonText: 'বই অর্ডার করুন',
      buttonLink: '/store'
    }
  ];
  await prisma.boardSettings.update({
    where: { id: s.id },
    data: { heroSlides: slides }
  });
  console.log('Slides updated!');
}

main().finally(() => prisma.$disconnect());
