import { ShareClient } from '../src';

async function main() {
    const client = await ShareClient.create({
        appKey: 'your app key',
        originHost: 'your origin host registered in kakaoDevelopers',
    });

    await client.sendCustom('room name', {
        link_ver: '4.0', // fixed value
        template_id: 12345, // your template id
        template_args: {
            VARIABLE1: 'VALUE1',
            VARIABLE2: 'VALUE2',
        },
    });
}

main();
