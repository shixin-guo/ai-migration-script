// const embeddingsPrompt = (name: string) => `
//   As an AI, I can assist you in locating specific files based on certain criteria. You're searching for files that include ${name}. The file paths should begin with either /vue2 or /vue3. Furthermore, the term ${name} must appear somewhere in the file path. Could you please generate the file paths that meet all these requirements?
// `;
const embeddingsPrompt = (name: string) => `${name}`;
const HumanPrompt = (name: string) => `
    You are provided source code of dialog components that use Vue2 and Vue3.
    Your task is to examine the ${name} dialog components in both versions. 
    Specifically, identify and compile a list of the properties, methods, and events that have been either renamed, removed or added in Vue3,
    rename should be in the format of {oldName}: {newName}.
    and make sure oldName is not equal to newName.
    excluding any elements that remain unchanged. 
    Your output should be a clear and concise list, 
    without any explanations or additional details.
    Please ensure that your list only includes the changes in Vue3 and does not include any unchanged elements from Vue2.
    return the list in json file like
    ~~~~
     {
        {
      "properties": {
        added: [],
        removed: [],
        renamed: {
          {oldName}: {newName}
        }
      },
      "methods": {
        added: [],
        removed: [],
        renamed: {
          {oldName}: {newName}
        }
      },
      "events": {
        added: [],
        removed: [],
        renamed: {
          {oldName}: {newName}
        }
      }
    }};
    ~~~~

  `;
const SystemPrompt = `
    As a Vue.js Frontend Developer, 
    aiming for unambiguous data presentation. 
    Refrain from incorporating any explanations or additional details. 
    The response should display the data in a clear,
    straightforward manner without any ambiguity.
    don't need wrapper by markdown 'typescript'
    I need a json file not a markdown file.
`;

export { HumanPrompt, SystemPrompt, embeddingsPrompt };
