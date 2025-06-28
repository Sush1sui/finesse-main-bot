import * as fs from "fs";
import * as path from "path";

// Define the input and output file paths
const inputFilePath = path.join(__dirname, "characters.txt");
const outputFilePath = path.join(__dirname, "characters.json");

// Function to read the text file, extract names, and write to JSON
function generateCharacterJson() {
  try {
    // Check if the input file exists
    if (!fs.existsSync(inputFilePath)) {
      console.error(`Input file not found at: ${inputFilePath}`);
      // Create a dummy input file for the user to fill in
      const dummyContent =
        "#1 - Zero Two 💞 - DARLING in the FRANXX\n#2 - Hatsune Miku 💞 - VOCALOID";
      fs.writeFileSync(inputFilePath, dummyContent, "utf-8");
      console.log(`Created a sample input file: ${inputFilePath}`);
      return;
    }

    // Read the input file
    const fileContent = fs.readFileSync(inputFilePath, "utf-8");
    const lines = fileContent.split("\n");

    const characters: { name: string }[] = [];

    // Process each line to extract the character name
    for (const line of lines) {
      if (line.trim() === "") continue; // Skip empty lines

      const parts = line.split(" - ");
      if (parts.length >= 2) {
        // This will remove the heart emoji if it exists, otherwise it does nothing
        const name = parts[1].trim().replace(" 💞", "");
        characters.push({ name });
      }
    }

    // Write the extracted data to the output JSON file
    fs.writeFileSync(
      outputFilePath,
      JSON.stringify(characters, null, 2),
      "utf-8"
    );

    console.log(`Successfully generated ${outputFilePath}`);
  } catch (error) {
    console.error(`An error occurred: ${(error as Error).message}`);
  }
}

// Run the script
generateCharacterJson();
