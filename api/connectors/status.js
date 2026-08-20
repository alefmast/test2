import { connectorStatus } from './index.js';
export default function handler(req,res){res.status(200).json({ok:true,connectors:connectorStatus()});}
