import sequelize from "./src/db/index.js";
import Token from "./src/models/Token.js";

const addToken = async() =>{
    try{
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        const token = await Token.create({
            tokenaddress: '0x1536656789',
            deployer: '0x123456789',
            name: 'Test Token',
            symbol: 'TST',
            supply: '1000000',
            image_url: 'https://example.com/token.png'
        });
        console.log('NEW token added:', token.toJSON());
    }
    catch(error){
        console.error(error);
    }

    finally{
        await sequelize.close();
    }

}

addToken();