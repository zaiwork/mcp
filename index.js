/**
 * @file zai mcp
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
const ZAI_DOMAIN = 'https://zizai.work';
const ZAI_API_BASE = `${ZAI_DOMAIN}/api/v3`;
// Create server instance
const server = new McpServer({
    name: 'zizai-mcp',
    version: '0.1.0',
    capabilities: {
        resources: {},
        tools: {},
    },
});
async function makeZaiRequest({ path, method, params }) {
    const url = `${ZAI_API_BASE}${path}`;
    try {
        const response = await fetch(url, {
            method: method || 'POST',
            body: method === 'POST' ? JSON.stringify(params) : undefined,
            headers: {
                'Content-Type': 'application/json',
                'zai-api-key': process.env.ZAI_API_KEY || ''
            }
        });
        return (await response.json());
    }
    catch (error) {
        console.error('Error making ZAI request:', error);
        throw error;
    }
}
// Register zizai tools
server.tool('get-work-list', 'Get a list of jobs items', {
    keyword: z.string().optional().describe('Keyword to search for'),
    // recruitType 可选 1/2/3
    recruitType: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional().default(1).describe('Recruit type')
}, async ({ keyword, recruitType }) => {
    try {
        const workData = await makeZaiRequest({
            path: '/work/list',
            method: 'POST',
            params: {
                keyword: keyword || '',
                recruitType
            },
        });
        if (!workData) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'Failed to retrieve jobs data.'
                    }
                ],
                isError: true
            };
        }
        if (workData.errno !== 0) {
            return {
                content: [
                    {
                        type: 'text',
                        text: workData.msg || 'Failed to retrieve jobs data.'
                    }
                ],
                isError: true
            };
        }
        if (workData.data?.length === 0) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'No jobs found.'
                    }
                ]
            };
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(workData.data.map(e => {
                        return {
                            name: e.name,
                            entityName: e.entityName,
                            entityShortname: e.entityShortname,
                            entityLogo: e.entityLogo ? `${ZAI_DOMAIN}${e.entityLogo}` : '',
                            responsibility: e.responsibility,
                            requirement: e.requirement,
                            benefit: e.benefit,
                            minSalary: e.minSalary,
                            maxSalary: e.maxSalary,
                            detailUrl: `${ZAI_DOMAIN}/zaier/work/${e.pin}`
                        };
                    }))
                }
            ]
        };
    }
    catch (e) {
        return {
            content: [
                {
                    type: 'text',
                    text: e?.message
                }
            ],
            isError: true
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log('ZIZAI MCP Server running on stdio.');
}
main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
