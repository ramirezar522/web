import bcrypt from 'bcrypt';

export const encrypt = async (passwordText) => {
    const hash = await bcrypt.hash(passwordText, 10);
    return hash;
};

export const verified = async (passwordText, hash) => {
    return await bcrypt.compare(passwordText, hash);
};