import { DataTypes } from 'sequelize';
import sequelize from '../db';

const Token = sequelize.define('Token', {
    tokenAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    deployer: DataTypes.STRING,
    name: DataTypes.STRING,
    symbol: DataTypes.STRING,
    supply: DataTypes.BIGINT,
    image_url: DataTypes.STRING // New field for image URL
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

export default Token;
