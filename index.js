/**
 * @file zai mcp
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import dayjs from 'dayjs';
const ZAI_DOMAIN = 'https://zizai.work';
const ZAI_API_BASE = `${ZAI_DOMAIN}/api/v3`;
const EDU_MAP = {
    0: '不详',
    1: '大专',
    2: '本科',
    3: '硕士',
    4: '博士',
};
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
server.tool('get-job-list', 'Get a list of jobs items', {
    keyword: z.string().optional().describe('Keyword to search for'),
    // recruitType: 1/2/3
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
                            workPin: e.pin,
                            name: e.name,
                            entityName: e.entityName,
                            entityShortname: e.entityShortname,
                            entityLogo: e.entityLogo ? `${ZAI_DOMAIN}${e.entityLogo}` : '',
                            responsibility: e.responsibility,
                            requirement: e.requirement,
                            welfare: e.benefit,
                            salary: !e.maxSalary ? '面议' : {
                                minSalary: e.minSalary / 100,
                                maxSalary: e.maxSalary / 100,
                            },
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
server.tool('apply-for-job', 'Apply for a job', {
    workPin: z.string().describe('pin for job you want to apply for'),
}, async ({ workPin }) => {
    try {
        const applyData = await makeZaiRequest({
            path: '/work/apply',
            method: 'POST',
            params: {
                workPin
            },
        });
        if (!applyData) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'Failed to apply for the job.'
                    }
                ],
                isError: true
            };
        }
        if (applyData.errno !== 0) {
            return {
                content: [
                    {
                        type: 'text',
                        text: applyData.msg || 'Failed to apply for the job.'
                    }
                ],
                isError: true
            };
        }
        return {
            content: [
                {
                    type: 'text',
                    text: `Successfully applied for the job. Check link: ${ZAI_DOMAIN}/zaier/match/${applyData.data.matchPin} for more details.`
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
server.tool('get-entity-list', 'Get a list of authorized recruitment entities', {}, async () => {
    try {
        const entityData = await makeZaiRequest({
            path: '/entity/listentity',
            method: 'POST',
            params: {},
        });
        if (!entityData) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'Failed to retrieve entity data.'
                    }
                ],
                isError: true
            };
        }
        if (entityData.errno !== 0) {
            return {
                content: [
                    {
                        type: 'text',
                        text: entityData.msg || 'Failed to retrieve entity data.'
                    }
                ],
                isError: true
            };
        }
        if (entityData.data?.length === 0) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'No entity found.'
                    }
                ]
            };
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(entityData.data.map(e => {
                        return {
                            entityPin: e.pin,
                            entityName: e.name,
                            entityShortname: e.shortname,
                            unifiedSocialCreditCode: e.unifiedSocialCreditCode,
                            entityLogo: e.logo ? `${ZAI_DOMAIN}${e.logo}` : '',
                            detailUrl: `${ZAI_DOMAIN}/entity/certification/detail?ep=${e.pin}`
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
server.tool('get-entity-jobs', 'Get a list of jobs for an entity', {
    entityPin: z.string().describe('entityPin for a entity'),
}, async ({ entityPin }) => {
    try {
        const workData = await makeZaiRequest({
            path: '/entity/listwork',
            method: 'POST',
            params: {
                entityPin
            }
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
                            workPin: e.pin,
                            name: e.name,
                            entityPin: e.entityPin,
                            responsibility: e.responsibility,
                            requirement: e.requirement,
                            welfare: e.benefit,
                            salary: !e.maxSalary ? '面议' : {
                                minSalary: e.minSalary,
                                maxSalary: e.maxSalary,
                            },
                            detailUrl: `${ZAI_DOMAIN}/entity/work/${e.pin}`
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
server.tool('get-recommend-talents', 'Get a list of talents that match the given job', {
    workPin: z.string().describe('workPin for the job'),
}, async ({ workPin }) => {
    try {
        const zaierData = await makeZaiRequest({
            path: '/entity/listreczaier',
            method: 'POST',
            params: {
                workPin
            }
        });
        if (!zaierData) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'Failed to retrieve talents data.'
                    }
                ],
                isError: true
            };
        }
        if (zaierData.errno !== 0) {
            return {
                content: [
                    {
                        type: 'text',
                        text: zaierData.msg || 'Failed to retrieve talents data.'
                    }
                ],
                isError: true
            };
        }
        if (zaierData.data?.length === 0) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'No talents found.'
                    }
                ]
            };
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(zaierData.data.map(e => {
                        return {
                            userPin: e.user_pin,
                            birthday: dayjs(e.birthday).format('YYYY-MM-DD'),
                            university: e.university,
                            major: e.major,
                            highestEducation: EDU_MAP[e.max_education || 0],
                            workYears: Math.floor((Date.now() - (e.first_work_time || Date.now())) / (1000 * 60 * 60 * 24 * 365)),
                            workName: e.matchData.workName,
                            matchDegree: e.matchData.matchDegree
                        };
                    }))
                },
                {
                    type: 'text',
                    text: `Check more detail at link: ${ZAI_DOMAIN}/entity/work/${zaierData.data[0].matchData.workPin}.`
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
server.tool('get-field-list', 'Get a list of job fields', {}, async () => {
    try {
        const fieldData = await makeZaiRequest({
            path: '/entity/listfields',
            method: 'POST',
            params: {}
        });
        if (!fieldData) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'Failed to retrieve fields data.'
                    }
                ],
                isError: true
            };
        }
        if (fieldData.errno !== 0) {
            return {
                content: [
                    {
                        type: 'text',
                        text: fieldData.msg || 'Failed to retrieve fields data.'
                    }
                ],
                isError: true
            };
        }
        if (fieldData.data?.length === 0) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'No fields found.'
                    }
                ]
            };
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(fieldData)
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
server.tool('post-a-job', 'Post a job for the entity', {
    entityPin: z.string().describe('entityPin for a entity'),
    jobName: z.string().describe('jobName for a job'),
    responsibility: z.string().describe('responsibility for a job'),
    requirement: z.string().describe('requirement for a job'),
    city: z.string().describe('work city for a job, multi cities separated by comma'),
    benefit: z.string().optional().describe('welfare for a job'),
    address: z.string().optional().describe('work location for a job'),
    fid: z.number().describe('field id for the job')
}, async ({ entityPin, jobName, responsibility, requirement, city, benefit, address, fid }) => {
    try {
        const submitData = await makeZaiRequest({
            path: '/entity/submitwork',
            method: 'POST',
            params: {
                entityPin,
                jobName,
                responsibility,
                requirement,
                city,
                benefit: benefit || '',
                address: address || '',
                fid
            }
        });
        if (!submitData) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'Failed to post the job.'
                    }
                ],
                isError: true
            };
        }
        if (submitData.errno !== 0) {
            return {
                content: [
                    {
                        type: 'text',
                        text: submitData.msg || 'Failed to post the job.'
                    }
                ],
                isError: true
            };
        }
        return {
            content: [
                {
                    type: 'text',
                    text: `Successfully post the job. Check link: ${ZAI_DOMAIN}/zaier/work/${submitData.data.pin} for more details.`
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
}
main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
