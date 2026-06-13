export const roles = [
    { roleName: process.env.NAME_ROLE_ADMIN || 'ADMIN', description: 'Administrator with full access' },
    { roleName: process.env.NAME_ROLE_USER  || 'USER',  description: 'Regular user with limited access' },
];

export const users = [
    { email: 'user@gmail.com',  userName: 'User',  roleName: process.env.NAME_ROLE_USER  || 'USER',  password: process.env.DEFAULT_PASSWORD || '123456' },
    { email: 'admin@gmail.com', userName: 'Admin', roleName: process.env.NAME_ROLE_ADMIN || 'ADMIN', password: process.env.DEFAULT_PASSWORD || '123456' },
];