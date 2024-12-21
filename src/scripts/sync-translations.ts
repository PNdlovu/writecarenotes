import { LokaliseApi } from '@lokalise/node-api';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const LOKALISE_API_TOKEN = process.env.LOKALISE_API_TOKEN;
const LOKALISE_PROJECT_ID = process.env.LOKALISE_PROJECT_ID;

if (!LOKALISE_API_TOKEN || !LOKALISE_PROJECT_ID) {
  console.error('Missing required environment variables. Please set LOKALISE_API_TOKEN and LOKALISE_PROJECT_ID');
  process.exit(1);
}

const lokaliseApi = new LokaliseApi({ apiKey: LOKALISE_API_TOKEN });

async function uploadTranslations() {
  const localesDir = path.join(process.cwd(), 'src', 'lib', 'i18n', 'locales');
  const files = await fs.readdir(localesDir);

  for (const file of files) {
    if (file.endsWith('.ts')) {
      const filePath = path.join(localesDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Convert TypeScript to JSON
      const jsonContent = content
        .replace(/export default/g, '')
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
        .replace(/'/g, '"');

      const tempJsonPath = path.join(process.cwd(), 'temp.json');
      await fs.writeFile(tempJsonPath, jsonContent);

      try {
        await lokaliseApi.files().upload({
          file: tempJsonPath,
          filename: `${file.replace('.ts', '.json')}`,
          lang_iso: file.replace('.ts', ''),
          project_id: LOKALISE_PROJECT_ID,
          replace_modified: false,
        });
        console.log(`Uploaded translations for ${file}`);
      } catch (error) {
        console.error(`Failed to upload ${file}:`, error);
      } finally {
        await fs.unlink(tempJsonPath);
      }
    }
  }
}

async function downloadTranslations() {
  try {
    const localesDir = path.join(process.cwd(), 'src', 'lib', 'i18n', 'locales');
    
    const response = await lokaliseApi.files().download({
      project_id: LOKALISE_PROJECT_ID,
      format: 'json',
      plural_format: 'i18next',
      placeholder_format: 'i18n',
      original_filenames: true,
      bundle_structure: '%LANG_ISO%.%FORMAT%',
    });

    const downloadUrl = response.bundle_url;
    
    // Download and extract the bundle
    const fetch = (await import('node-fetch')).default;
    const res = await fetch(downloadUrl);
    const buffer = await res.buffer();
    
    // Save and process each translation file
    for (const lang of ['en', 'en-GB-SCT', 'cy', 'en-IE', 'ga', 'es', 'fr', 'de']) {
      const content = JSON.parse(buffer.toString());
      const tsContent = `export default ${JSON.stringify(content[lang], null, 2)};`;
      await fs.writeFile(path.join(localesDir, `${lang}.ts`), tsContent);
      console.log(`Updated translations for ${lang}`);
    }
  } catch (error) {
    console.error('Failed to download translations:', error);
  }
}

async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'upload':
      await uploadTranslations();
      break;
    case 'download':
      await downloadTranslations();
      break;
    default:
      console.error('Please specify either "upload" or "download"');
      process.exit(1);
  }
}

main().catch(console.error);
