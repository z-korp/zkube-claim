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
    """Scraper for StarkScan NFT holders list"""
    
    def __init__(self, headless: bool = True):
        """
        Initialize the scraper
        
        Args:
            headless: Whether to run browser in headless mode
        """
        self.headless = headless
        
    def _extract_holders_from_page(self, page, collection_name: str) -> List[NFTHolder]:
        """Extract holders data from current page"""
        holders = []
        
        # Wait for the table to be loaded and ensure data is present
        page.wait_for_selector("table tbody tr", timeout=30000)
        
        # Scroll to load all data
        last_height = 0
        while True:
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
        
        print(f"Found {len(rows)} rows in table")
        
        for row in rows:
            try:                
                # Get first column and extract full address from tooltip
                address_element = row.query_selector("td:nth-child(2)")
                if not address_element:
                    print("No address element found in row")
                    continue
                href_element = address_element.query_selector("a")
                if href_element:
                    href = href_element.get_attribute("href")
                else:
                    print("No href found in address element")
                
                address = href.split('/')[-1]
                
                # Extract quantity using more specific selectors
                quantity_element = row.query_selector("td:nth-child(3)")
                
                if quantity_element:
                    quantity_text = quantity_element.inner_text().strip()
                   
                    print(f"Processing: Address={address}, Quantity={quantity_text}, Collection={collection_name}")
                    
                    quantity = quantity_text
                    
                    holders.append(NFTHolder(
                        address=address,
                        quantity=quantity,
                        collection=collection_name
                    ))
                else:
                    print("Missing quantity data")
                    
            except Exception as e:
                print(f"Error processing row: {str(e)}")
                print(f"Row HTML: {row.inner_html()}")  # Debug the HTML content
                continue
                
        if not holders:
            print("Warning: No holders data was extracted!")
            
        return holders

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
                    
                    # Extract all holders from scrollable page
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
        # Calculate timestamp 10 days from now
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
    "slinks": {
        "address": "0x013ff4e86fa3e7286cc5c64b62f4099cf41e7918d727d22a5109ecfd00274d19",
        "type": "token"
    },
    # "influnce": {
    #     "address": "0x0241b9c4ce12c06f49fee2ec7c16337386fa5185168f538a7631aacecdf3df74",
    #     "type": "nft"
    # },
    # "loot-survivor": {
    #     "address": "0x018108b32cea514a78ef1b0e4a0753e855cdf620bc0565202c02456f618c4dc4",
    #     "type": "nft"
    # },
    # "pain-au-lait": {
    #     "address": "0x049201f03a0f0a9e70e28dcd74cbf44931174dbe3cc4b2ff488898339959e559",
    #     "type": "token"
    # },
    # "ducks": {
    #     "address": "0x04fa864a706e3403fd17ac8df307f22eafa21b778b73353abf69a622e47a2003",
    #     "type": "nft"
    # },
    # "blobert": {
    #     "address": "0x00539f522b29ae9251dbf7443c7a950cf260372e69efab3710a11bf17a9599f1",
    #     "type": "nft"
    # }
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