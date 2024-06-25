const config = {
  name: "recipe",
  aliases: ["recipe"],
  description: "An AI dedicated to searching for recipes and their procedures efficiently.",
  usage: "[meal name]",
  cooldown: 3,
  isAbsolute: false,
  isHidden: false,
  credits: "Chael",
};

const langData = {
  "en_US": {
    "message": "Hello",
    "no_query": "Please provide a meal name. \n\nExample: [!recipe sushi]",
  }
};

/** @type {TOnCallCommand} */
async function onCall({ message, args, getLang, extra, data, userPermissions, prefix }) {
  const mealName = args.join(" ");

  if (!mealName) {
    message.send(getLang("no_query"));
    return;
  }

  const apiUrl = `https://openapi-idk8.onrender.com/meals?name=${encodeURIComponent(mealName)}`;

  try {
    await message.reply(`Searching...`);
    message.react('⏱️');
    
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (response.ok) {
      const meals = result.meals;
      if (!meals || meals.length === 0) {
        message.reply("No results found.");
        message.react('⚠️');
        return;
      }

      const meal = meals[0]; // Take the first meal found
      const instructions = meal.strInstructions ? meal.strInstructions.replace(/\r\n/g, "\n") : "No instructions available.";
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && measure) {
          ingredients.push(`${ingredient} - ${measure}`);
        }
      }

      const mealDetails = `
        Name: ${meal.strMeal}
        Category: ${meal.strCategory}
        Area: ${meal.strArea}
        Ingredients:
        ${ingredients.join("\n")}
        Instructions:
        ${instructions}
        Source: ${meal.strSource}
      `;

      message.reply(`Here is the meal I found:\n\n${mealDetails}`);
      message.react('✅');
    } else {
      message.reply("Sorry, I couldn't get a response from the service. Please try again later.");
      message.react('⚠️');
    }
  } catch (error) {
    message.reply("Oops! Something went wrong while trying to get a response. Please check your internet connection and try again.");
    message.react('⚠️');
  }
}

export default {
  config,
  langData,
  onCall
};
