import { Handler } from "@netlify/functions";

const headers = {
    'Access-Control-Allow-Origin': process.env.ORIGIN_URL,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST'
}

const handler: Handler = async (event, context) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers
        }
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
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
        statusCode: 401,
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