from starknet_py.net.full_node_client import FullNodeClient
from starknet_py.contract import Contract
import asyncio
import json
import logging
from typing import Set

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
RPC_URL = "https://starknet-mainnet.public.blastapi.io/"
CONTRACT_ADDRESS = "0x07ae27a31bb6526e3de9cf02f081f6ce0615ac12a6d7b85ee58b8ad7947a2809"

async def get_owner_of(contract: Contract, token_id: int) -> str | None:
    """
    Essaie de récupérer le propriétaire d'un token
    """
    try:
        result = await contract.functions["owner_of"].call(token_id)
        return hex(result[0])
    except Exception as e:
        # logger.debug(f"Token {token_id} n'existe pas ou erreur: {str(e)}")
        return None

async def get_nft_holders(contract: Contract) -> Set[str]:
    """
    Récupère tous les holders uniques de la collection NFT
    """
    holders = set()
    consecutive_failures = 0
    max_consecutive_failures = 100  # Arrête après 100 échecs consécutifs
    batch_size = 10
    current_token_id = 0
    
    try:
        while consecutive_failures < max_consecutive_failures:
            tasks = []
            
            # Créer un batch de requêtes
            for i in range(batch_size):
                token_id = current_token_id + i
                tasks.append(get_owner_of(contract, token_id))
            
            # Exécuter le batch
            results = await asyncio.gather(*tasks)
            
            # Traiter les résultats
            found_valid_token = False
            for i, owner in enumerate(results):
                if owner is not None:
                    found_valid_token = True
                    consecutive_failures = 0
                    holders.add(owner)
                    logger.info(f"Token {current_token_id + i} appartient à {owner}")
            
            if not found_valid_token:
                consecutive_failures += 1
                logger.info(f"Aucun token valide trouvé dans la plage {current_token_id}-{current_token_id + batch_size - 1}")
            
            current_token_id += batch_size
            
            # Petit délai entre les batches
            await asyncio.sleep(0.5)
            
            # Log de progression
            if len(holders) > 0 and current_token_id % 50 == 0:
                logger.info(f"Progression: {len(holders)} holders uniques trouvés jusqu'à présent")

        logger.info(f"Recherche terminée après avoir vérifié jusqu'au token {current_token_id}")
        return holders

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des holders: {str(e)}")
        return holders

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
        contract = await Contract.from_address(
            address=CONTRACT_ADDRESS,
            provider=client
        )
        logger.info("Contrat initialisé")

        # Afficher les fonctions disponibles
        logger.info("Fonctions disponibles dans le contrat:")
        for func in contract.data.abi:
            if func.get('type') == 'function':
                logger.info(f"- {func.get('name')}")

        # Récupérer les holders
        holders = await get_nft_holders(contract)
        
        if holders:
            # Sauvegarder les résultats
            await save_holders(holders, CONTRACT_ADDRESS)
        else:
            logger.error("Aucun holder trouvé")

    except Exception as e:
        logger.error(f"Erreur dans la fonction principale: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())