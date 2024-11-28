from playwright.sync_api import sync_playwright
import time
from typing import List, Dict, Optional
from dataclasses import dataclass
import pandas as pd
from datetime import datetime, timedelta

@dataclass
class NFTHolder:
    """Data class for NFT holder information"""
    address: str
    quantity: int
    collection: str

class StarkScanHoldersScraper:
    """Scraper for StarkScan NFT holders list with holder limit"""
    
    def __init__(self, headless: bool = True, holder_limit: int = 3000):
        """
        Initialize the scraper
        
        Args:
            headless: Whether to run browser in headless mode
            holder_limit: Maximum number of holders to collect per collection
        """
        self.headless = headless
        self.holder_limit = holder_limit
        
    def _extract_holders_from_page(self, page, collection_name: str) -> List[NFTHolder]:
        """Extract holders data from current page until limit is reached"""
        holders = []
        
        # Wait for the table to be loaded and ensure data is present
        page.wait_for_selector("table tbody tr", timeout=30000)
        
        # Scroll to load data until we hit the limit
        last_height = 0
        while len(holders) < self.holder_limit:
            # Scroll to bottom
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(2)  # Wait for data to load
            
            # Calculate new scroll height
            new_height = page.evaluate("document.body.scrollHeight")
            
            # Break if no more content loaded
            if new_height == last_height:
                break
                
            last_height = new_height
            
            # Get all rows from the table
            rows = page.query_selector_all("table tbody tr")
            
            # Clear holders list and process all visible rows
            holders.clear()  # Clear to avoid duplicates
            print(f"Processing {len(rows)} rows...")
            
            for row in rows:
                try:                
                    # Get first column and extract full address from tooltip
                    address_element = row.query_selector("td:nth-child(2)")
                    if not address_element:
                        continue
                    href_element = address_element.query_selector("a")
                    if not href_element:
                        continue
                    
                    href = href_element.get_attribute("href")
                    address = href.split('/')[-1]
                    
                    # Extract quantity
                    quantity_element = row.query_selector("td:nth-child(3)")
                    if not quantity_element:
                        continue
                        
                    quantity_text = quantity_element.inner_text().strip()
                    
                    holders.append(NFTHolder(
                        address=address,
                        quantity=quantity_text,
                        collection=collection_name
                    ))
                    
                    # Check if we've hit the limit
                    if len(holders) >= self.holder_limit:
                        print(f"Reached holder limit of {self.holder_limit}")
                        break
                        
                except Exception as e:
                    print(f"Error processing row: {str(e)}")
                    continue
            
            if len(holders) >= self.holder_limit:
                break
                
        print(f"Collected {len(holders)} holders for {collection_name}")
        return holders[:self.holder_limit]  # Ensure we don't exceed the limit

    def get_all_holders(
        self,
        collections: Dict[str, Dict[str, str]],
        export_csv: bool = False
    ) -> List[NFTHolder]:
        """
        Get the list of all NFT holders for multiple collections
        
        Args:
            collections: Dictionary mapping collection names to contract addresses
            export_csv: Whether to export results to CSV
            
        Returns:
            List of NFTHolder objects
        """
        all_holders = []
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=self.headless)
            context = browser.new_context()
            page = context.new_page()
            
            for collection_name, collection_info in collections.items():
                try:
                    # Generate URL based on collection type
                    contract_type = "nft-contract" if collection_info["type"] == "nft" else "token"
                    url = f"https://starkscan.co/{contract_type}/{collection_info['address']}#holders"
                    print(f"\nScraping collection: {collection_name}")
                    
                    # Navigate to the contract page
                    page.goto(url)
                    page.wait_for_selector("table", timeout=10000)
                    
                    # Extract holders from scrollable page
                    page_holders = self._extract_holders_from_page(page, collection_name)
                    all_holders.extend(page_holders)
                        
                except Exception as e:
                    print(f"Error scraping collection {collection_name}: {e}")
                    continue
                    
            # Clean up
            context.close()
            browser.close()
        
        # Export to CSV if requested
        if export_csv and all_holders:
            self._export_to_csv(all_holders)
            
        return all_holders
    
    def _export_to_csv(self, holders: List[NFTHolder], filename: str = "nft_holders.csv"):
        """Export holders data to CSV"""
        future_date = datetime.now() + timedelta(days=10)
        future_timestamp = int(future_date.timestamp())

        df = pd.DataFrame([{
            'address': h.address,
            'quantity': h.quantity,
            'collection': h.collection,
            'expiration_timestamp': future_timestamp
        } for h in holders])
        
        df.to_csv(filename, index=False)
        print(f"Data exported to {filename}")

# Example usage
if __name__ == "__main__":
    # Dictionary mapping collection names to contract addresses
    COLLECTIONS = {
    #"realms": {
    #    "address": "0x07ae27a31bb6526e3de9cf02f081f6ce0615ac12a6d7b85ee58b8ad7947a2809",
    #    "type": "nft"
    #},
    #"ducks" : {
    #    "address": "0x04fa864a706e3403fd17ac8df307f22eafa21b778b73353abf69a622e47a2003",
    #    "type": "nft"
    #},
    #"slinks": {
    #    "address": "0x013ff4e86fa3e7286cc5c64b62f4099cf41e7918d727d22a5109ecfd00274d19",
    #    "type": "token"
    #},
    #"brother": {
    #    "address": "0x03b405a98c9e795d427fe82cdeeeed803f221b52471e3a757574a2b4180793ee",
    #    "type": "token"
    #},
    "alf": {
        "address": "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
        "type": "token"
    }
    # "influence": {
    #     "address": "0x0241b9c4ce12c06f49fee2ec7c16337386fa5185168f538a7631aacecdf3df74",
    #     "type": "nft"
    # },
    # "loot-survivor": {
    #     "address": "0x018108b32cea514a78ef1b0e4a0753e855cdf620bc0565202c02456f618c4dc4",
    #     "type": "nft"
    # },
    #"pain-au-lait": {
    #     "address": "0x049201f03a0f0a9e70e28dcd74cbf44931174dbe3cc4b2ff488898339959e559",
    #     "type": "token"
    #},
    # "blobert": {
    #     "address": "0x00539f522b29ae9251dbf7443c7a950cf260372e69efab3710a11bf17a9599f1",
    #     "type": "nft"
    # },
    # "everai" : {
    #     "address": "0x02acee8c430f62333cf0e0e7a94b2347b5513b4c25f699461dd8d7b23c072478",
    #     "type": "nft"
    # }
    #"lords": {
    #    "address": "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
    #    "type": "token"
    #}
    }
    
    scraper = StarkScanHoldersScraper(headless=False)
    
    holders = scraper.get_all_holders(
        collections=COLLECTIONS,
        export_csv=True
    )
    
    # Print results
    print(f"\nFound {len(holders)} total holders across all collections:")
    for holder in holders[:5]:
        print(f"Collection: {holder.collection}")
        print(f"Address: {holder.address}")
        print(f"Quantity: {holder.quantity}")
        print("---")

    print(f"Total holders: {len(holders)}")