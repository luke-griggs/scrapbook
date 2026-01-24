import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { categories, prompts } from "../lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const seedData = [
  {
    name: "Early Childhood",
    slug: "early-childhood",
    description: "Stories from the beginning",
    prompts: [
      "Who were your favorite childhood friends?",
      "What was your favorite toy growing up?",
      "Tell us about your childhood home",
      "What's your earliest memory?",
      "What games did you play as a child?",
      "Describe a time you got in trouble as a kid",
      "Tell us about a time you got in trouble at school",
      "Describe a childhood moment when you realized you were in big trouble",
    ],
  },
  {
    name: "Teen Years",
    slug: "teen-years",
    description: "Growing up stories",
    prompts: [
      "What was your favorite subject in school?",
      "Tell us about your best friend in high school",
      "What music did you listen to as a teenager?",
      "What was your first job?",
      "What did you dream of becoming?",
      "What was the moment you felt like an adult for the first time?",
    ],
  },
  {
    name: "Adventures in Travel",
    slug: "adventures-travel",
    description: "Places and journeys",
    prompts: [
      "What's the most memorable trip you've taken?",
      "Where would you love to visit someday?",
      "Tell us about a travel mishap that became a funny story",
      "What's the most beautiful place you've ever seen?",
      "Describe your dream vacation",
    ],
  },
  {
    name: "Family Traditions",
    slug: "family-traditions",
    description: "Customs passed down",
    prompts: [
      "What holiday traditions did your family have?",
      "What recipes have been passed down in your family?",
      "Tell us about a memorable family gathering",
      "What values did your parents teach you?",
      "What traditions do you want to pass on?",
      "What's a lesson someone in the family taught you that stuck with you?",
    ],
  },
  {
    name: "Love & Relationships",
    slug: "love-relationships",
    description: "Matters of the heart",
    prompts: [
      "How did you meet your partner?",
      "What's the best relationship advice you've received?",
      "Tell us about your wedding day",
      "What makes a relationship last?",
      "Describe a moment when you felt truly loved",
    ],
  },
  {
    name: "Life Lessons",
    slug: "life-lessons",
    description: "Wisdom gained",
    prompts: [
      "What's the biggest risk you ever took?",
      "What do you wish you knew at 20?",
      "What are you most proud of?",
      "Tell us about a moment that changed your life",
      "What advice would you give your younger self?",
    ],
  },
  {
    name: "Learning the Hard Way",
    slug: "learning-hard-way",
    description: "Lessons from mistakes and tough moments",
    prompts: [
      "Describe a mistake you made that taught you something important.",
      "Describe a time you learned a hard lesson",
      "Tell us about a moment when you got caught doing something you shouldn't have been doing.",
      "Tell us about an embarrassing moment you can laugh about now.",
      "Describe a time someone gave you tough love and it changed you.",
    ],
  },
];

async function seed() {
  console.log("Seeding database...");

  for (let i = 0; i < seedData.length; i++) {
    const category = seedData[i];
    
    // Insert category
    const [insertedCategory] = await db
      .insert(categories)
      .values({
        name: category.name,
        slug: category.slug,
        description: category.description,
        displayOrder: String(i + 1),
      })
      .returning();

    console.log(`Created category: ${category.name}`);

    // Insert prompts for this category
    for (let j = 0; j < category.prompts.length; j++) {
      await db.insert(prompts).values({
        categoryId: insertedCategory.id,
        text: category.prompts[j],
        displayOrder: String(j + 1),
      });
    }

    console.log(`  - Added ${category.prompts.length} prompts`);
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
