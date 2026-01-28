import { Handler } from "@netlify/functions";

const headers = {
    'Access-Control-Allow-Origin': '*', // unsafe to allow any origin; fix this
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST'
}

const handler: Handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 200,
            headers
        }
    }

    const { password } = JSON.parse(event.body);

    if (password === process.env.NETLIFY_PASSWORD) {
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
            headers
        };
    }

    return {
        statusCode: 500,
        body: JSON.stringify({ success: false }),
        headers
    };
};

export { handler };

export const config = {
    path: "/",
    rateLimit: {
        windowLimit: 20,
        windowSize: 60,
        aggregateBy: ["ip", "domain"],
    }
};