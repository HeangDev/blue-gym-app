import {cookies} from 'next/headers';
import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async () => {
    // Static for now, we'll change this later
    const locale = 'kh';
    
    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});