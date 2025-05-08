## 自在招聘 MCP Server

### 简介
自在招聘 MCP Server，是国内首家支持 MCP 协议的招聘平台。

### 工具列表
1. `get-job-list`
   - 获取推荐的职位列表
   - Input: 
     - `keyword` (string, 可选): 职位搜索关键词。
     - `recruitType` (number, 可选): 职位类型，1-社招，2-校招，2-实习
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
   - 投递职位
   - Inputs:
     - `workPin` (string) 职位唯一码
   - Returns:

### 快速开始

支持任意 MCP 协议的客户端（如：Cursor、Claude、Cline）可方便使用自在招聘 MCP server。如下以 Claude 平台为例:

1. 申请 API Key
在 [https://zizai.work/user/apikey](https://zizai.work/user/apikey) 中申请获取。

2. 配置 MCP Server
将以下配置添加到配置文件中，ZAI_API_KEY 是访问自在招聘开放平台 API 的 AK。

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

