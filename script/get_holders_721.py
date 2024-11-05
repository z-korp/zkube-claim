from starknet_py.net.account.account import Account
from starknet_py.net.full_node_client import FullNodeClient
from starknet_py.net.models import StarknetChainId
from starknet_py.contract import Contract
import asyncio
import json
import logging
from typing import List, Set

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
RPC_URL = "https://starknet-mainnet.public.blastapi.io/" 
CONTRACT_ADDRESS = "0x07ae27a31bb6526e3de9cf02f081f6ce0615ac12a6d7b85ee58b8ad7947a2809"

async def get_contract(client: FullNodeClient, contract_address: str) -> Contract:
    """
    Initialise le contrat avec l'ABI ERC721 minimal nécessaire
    """
    # ABI minimal pour les fonctions ERC721 nécessaires
    minimal_abi = [
        {
            "name": "balanceOf",
            "type": "function",
            "inputs": [{"name": "owner", "type": "felt"}],
            "outputs": [{"name": "balance", "type": "Uint256"}],
        },
        {
            "name": "totalSupply",
            "type": "function",
            "inputs": [],
            "outputs": [{"name": "totalSupply", "type": "Uint256"}],
        },
        {
            "name": "ownerOf",
            "type": "function",
            "inputs": [{"name": "tokenId", "type": "Uint256"}],
            "outputs": [{"name": "owner", "type": "felt"}],
        }
    ]

    contract = await Contract.from_address(
        address=contract_address,
        provider=client,
    )

    return contract

async def get_nft_holders(client: FullNodeClient, contract: Contract) -> Set[str]:
    """
    Récupère tous les holders uniques de la collection NFT
    """
    holders = set()
    
    try:
        # Récupérer le total supply
        total_supply_call = await contract.functions["totalSupply"].call()
        total_supply = total_supply_call[0]  # Modification ici pour accéder au résultat
        logger.info(f"Total supply: {total_supply}")

        # Traitement par lots de 10 tokens
        batch_size = 10
        for i in range(0, total_supply, batch_size):
            batch_end = min(i + batch_size, total_supply)
            tasks = []
            
            # Créer les tâches pour le batch
            for token_id in range(i, batch_end):
                tasks.append(contract.functions["ownerOf"].call(token_id))
            
            # Exécuter les tâches en parallèle
            try:
                responses = await asyncio.gather(*tasks, return_exceptions=True)
                for j, response in enumerate(responses):
                    if not isinstance(response, Exception):
                        owner_address = hex(response[0])  # Modification ici pour accéder au résultat
                        holders.add(owner_address)
                    else:
                        logger.warning(f"Erreur pour le token {i+j}: {str(response)}")
                
                logger.info(f"Processed tokens {i} to {batch_end-1} / {total_supply}")
                
                # Petit délai entre les batches pour éviter la surcharge
                await asyncio.sleep(0.5)
                
            except Exception as e:
                logger.error(f"Erreur lors du traitement du batch {i}-{batch_end}: {str(e)}")
                continue

        return holders

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des holders: {str(e)}")
        return set()

async def save_holders(holders: Set[str], contract_address: str):
    """
    Sauvegarde les holders dans un fichier JSON
    """
    output_file = 'nft_holders.json'
    data = {
        "contract_address": contract_address,
        "holders": list(holders),
        "total_holders": len(holders)
    }
    
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=4)
    
    logger.info(f"Données sauvegardées dans {output_file}")
    logger.info(f"Nombre total de holders uniques: {len(holders)}")

async def main():
    try:
        # Initialiser le client
        client = FullNodeClient(node_url=RPC_URL)
        logger.info("Client initialisé")

        # Initialiser le contrat
        contract = await get_contract(client, CONTRACT_ADDRESS)
        logger.info("Contrat initialisé")

        # Récupérer les holders
        holders = await get_nft_holders(client, contract)
        
        if holders:
            # Sauvegarder les résultats
            await save_holders(holders, CONTRACT_ADDRESS)
        else:
            logger.error("Aucun holder trouvé")

    except Exception as e:
        logger.error(f"Erreur dans la fonction principale: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())