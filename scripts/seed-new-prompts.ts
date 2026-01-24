import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { categories, prompts } from "../lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// New prompts to add to existing categories
const newPrompts = [
  {
    categorySlug: "early-childhood",
    prompts: [
      "Describe a time you got in trouble as a kid",
      "Tell us about a time you got in trouble at school",
      "Describe a childhood moment when you realized you were in big trouble",
    ],
  },
  {
    categorySlug: "teen-years",
    prompts: [
      "What was the moment you felt like an adult for the first time?",
    ],
  },
  {
    categorySlug: "family-traditions",
    prompts: [
      "What's a lesson someone in the family taught you that stuck with you?",
    ],
  },
];

// New category to create
const newCategory = {
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
};

async function seedNewPrompts() {
  console.log("Adding new prompts to existing categories...");

  // Add prompts to existing categories
  for (const item of newPrompts) {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, item.categorySlug));

    if (!category) {
      console.log(`Category ${item.categorySlug} not found, skipping...`);
      continue;
    }

    // Get current prompt count for display order
    const existingPrompts = await db
      .select()
      .from(prompts)
      .where(eq(prompts.categoryId, category.id));

    let order = existingPrompts.length + 1;

    for (const promptText of item.prompts) {
      await db.insert(prompts).values({
        categoryId: category.id,
        text: promptText,
        displayOrder: String(order++),
      });
    }

    console.log(`Added ${item.prompts.length} prompts to ${category.name}`);
  }

  // Create new category
  console.log("\nCreating new category: Learning the Hard Way...");
  
  const [insertedCategory] = await db
    .insert(categories)
    .values({
      name: newCategory.name,
      slug: newCategory.slug,
      description: newCategory.description,
      displayOrder: "7",
    })
    .returning();

  for (let i = 0; i < newCategory.prompts.length; i++) {
    await db.insert(prompts).values({
      categoryId: insertedCategory.id,
      text: newCategory.prompts[i],
      displayOrder: String(i + 1),
    });
  }

  console.log(`Added ${newCategory.prompts.length} prompts to ${newCategory.name}`);
  console.log("\nSeeding complete!");
}

seedNewPrompts().catch(console.error);
