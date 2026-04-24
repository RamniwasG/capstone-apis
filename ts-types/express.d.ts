import { JwtUserPayload } from './index';

declare module 'express-serve-static-core' {
    interface Request {
        user?: JwtUserPayload;
    }
}
