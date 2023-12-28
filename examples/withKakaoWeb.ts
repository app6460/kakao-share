import { AuthApiClient } from 'kakao-web';
import { ShareClient } from 'kakao-share';

async function main() {
    const apiClient = await AuthApiClient.create({
        serviceURL: 'https://example.com',
    });

    const res = await apiClient.login({
        email: 'email@example.com',
        password: 'password',
    });

    const shareClient = await ShareClient.create({
        appKey: 'your app key',
        originHost: 'your origin host registered in kakaoDevelopers',
        cookie: res.cookieJar.toJSON(),
    });

    await shareClient.send({
        action: 'custom',
        roomName: 'room name',
        template: {
            link_ver: '4.0', // fixed value
            template_id: 12345, // your template id
            template_args: {
                VARIABLE1: 'VALUE1',
                VARIABLE2: 'VALUE2',
            },
        }
    });
}

main();
