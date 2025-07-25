import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Process group files to read from
const QUESTION_FILES = ['in.ts', 'pl.ts', 'cl.ts', 'mc.ts', 'ex.ts'];

// Function to shuffle array and pick random items
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function createSampleQuestions(): Promise<void> {
  try {
    console.log('=== Creating sample questions file ===');
    
    let allSampleQuestions: any[] = [];
    
    // Read questions from each file
    for (const fileName of QUESTION_FILES) {
      try {
        const filePath = path.join(__dirname, '..', 'questions', fileName);
        console.log(`Reading file: ${filePath}`);
        
        const fileContent = await fs.readFile(filePath, 'utf-8');
        
        // Extract the JSON data from the TypeScript export
        const jsonMatch = fileContent.match(/export const questionsData = ({[\s\S]*});/);
        if (!jsonMatch) {
          console.warn(`Invalid file format in ${fileName}`);
          continue;
        }
        
        const data = JSON.parse(jsonMatch[1]);
        const fileQuestions = data.questions || [];
        
        // Filter for valid questions
        const validQuestions = fileQuestions.filter((q: any) => q.is_valid === true);
        console.log(`Found ${validQuestions.length} valid questions in ${fileName}`);
        
        // Get 12 random valid questions
        const randomQuestions = getRandomItems(validQuestions, 12);
        console.log(`Selected ${randomQuestions.length} random questions from ${fileName}`);
        
        allSampleQuestions.push(...randomQuestions);
        
      } catch (fileError) {
        console.error(`Error reading file ${fileName}:`, fileError);
        continue;
      }
    }
    
    console.log(`Total sample questions collected: ${allSampleQuestions.length}`);
    
    // Create the sample.ts file content
    const sampleFileContent = `export const questionsData = ${JSON.stringify({ questions: allSampleQuestions }, null, 2)};`;
    
    // Write to sample.ts file
    const sampleFilePath = path.join(__dirname, '..', 'questions', 'sample.ts');
    await fs.writeFile(sampleFilePath, sampleFileContent, 'utf-8');
    
    console.log(`✅ Sample questions file created at: ${sampleFilePath}`);
    console.log(`Total questions in sample file: ${allSampleQuestions.length}`);
    
  } catch (error) {
    console.error('❌ Error creating sample questions:', error);
    process.exit(1);
  }
}

// Run the function
createSampleQuestions();