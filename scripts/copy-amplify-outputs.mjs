import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const rootDir = process.cwd()
const sourcePath = path.join(rootDir, 'amplify_outputs.json')
const publicDir = path.join(rootDir, 'public')
const targetPath = path.join(publicDir, 'amplify_outputs.json')

function fail(message) {
  console.error(message)
  process.exit(1)
}

let raw
try {
  raw = fs.readFileSync(sourcePath, 'utf-8')
} catch (error) {
  fail(
    'Failed to read amplify_outputs.json from project root.\n' +
      'Run `npx amplify sandbox` to generate it, then re-run the build.'
  )
}

let outputs
try {
  outputs = JSON.parse(raw)
} catch (error) {
  fail('amplify_outputs.json is not valid JSON. Please regenerate it.')
}

const auth = outputs?.auth
const userPoolId = auth?.user_pool_id
const userPoolClientId = auth?.user_pool_client_id

if (!userPoolId || !userPoolClientId) {
  fail(
    'amplify_outputs.json is missing required Cognito auth configuration.\n' +
      'Expected: auth.user_pool_id and auth.user_pool_client_id.\n' +
      'Run `npx amplify sandbox` to generate a full outputs file, then re-run.'
  )
}

try {
  fs.mkdirSync(publicDir, { recursive: true })
  fs.writeFileSync(targetPath, JSON.stringify(outputs, null, 2) + '\n', 'utf-8')
  console.log('Copied amplify_outputs.json -> public/amplify_outputs.json')
} catch (error) {
  fail('Failed to write public/amplify_outputs.json. Please check permissions.')
}
