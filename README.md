# ZIZAI Recruitment MCP Server

MCP Server for ZIZAI Recruitment API.

# ZIZAI Recruitment
ZIZAI Recruitment (https://zizai.work) is a next-generation intelligent recruitment platform based on professional assessments, enabling efficient and precise matching between talents and job positions.

Join us and experience the charm of intelligent recruitment now!

## Tools

### Job Seekers
1. `get-job-list`
   - Retrieve a list of recommended job positions
   - Input: 
     - `keyword` (string, optional): Search keyword for job positions.
     - `recruitType` (number, optional): Job type, 1 - Social Recruitment, 2 - Campus Recruitment, 3 - Internship.
   - Returns: 
     - Array of {
       - `workPin`: string
       - `name`: string
       - `entityName`: string
       - `entityShortname`: string
       - `responsibility`: string
       - `requirement`: string
       - `welfare`: string
       - `salary`: { minSalary: number, maxSalary: number } | string
       - `detailUrl`: string
     }

2. `apply-for-job`
   - Apply for a job position
   - Input:
     - `workPin` (string) Unique code for the job position
   - Returns:

### Recruiters
1. `get-entity-list`
   - Retrieve a list of managed entities
   - Input: 
   - Returns: 
     - Array of {
       - `entityPin`: string
       - `entityName`: string
       - `entityShortname`: string
       - `unifiedSocialCreditCode`: string
       - `entityLogo`: string
       - `detailUrl`: string
     }

2. `get-entity-jobs`
   - Retrieve job positions published under an entity
   - Input: 
     - `entityPin` (string): Unique code for the entity
   - Returns: 
     - Array of {
       - `workPin`: string
       - `name`: string
       - `entityPin`: string
       - `responsibility`: string
       - `requirement`: string
       - `welfare`: string
       - `salary`: { minSalary: number, maxSalary: number } | string
       - `detailUrl`: string
     }

3. `get-recommend-talents`
   - Retrieve recommended talents for a job position
   - Input: 
     - `workPin` (string): Unique code for the job position
   - Returns: 
     - Array of {
       - `userPin`: string
       - `birthday`: string
       - `university`: string
       - `major`: string
       - `highestEducation`: string
       - `workYears`: number
       - `workName`: string
       - `matchDegree`: number
     }

4. `get-field-list`
   - Retrieve a list of fields
   - Input:
   - Returns: 
     - Array of {
       - `fid`: number
       - `name`: string
     }

5. `post-a-job`
   - Post a job position
   - Input: 
     - `entityPin` (string): Unique code for the entity
     - `fid` (number): Field to which the job position belongs
     - `jobName` (string): Name of the job position
     - `responsibility` (string): Job responsibilities
     - `requirement` (string): Job requirements
     - `city` (string): Job city
     - `benefit` (string, optional): Job benefits
     - `address` (string, optional): Job address
   - Returns:

## Setup

### API Key
Get a ZIZAI Work API key by following the instructions [here](https://zizai.work/user/apikey).

### Usage with Claude Desktop

Add the following to your `claude_desktop_config.json`:

### NPX

```json
{
  "mcpServers": {
    "zaiwork": {
      "command": "npx",
      "args": [
        "-y",
        "@zizaiwork/mcp"
      ],
      "env": {
        "ZAI_API_KEY": "<YOUR_API_KEY>"
      }
    }
  }
}
```

## License

This MCP server is licensed under the Apache-2.0 License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the Apache-2.0 License. For more details, please see the LICENSE file in the project repository.
