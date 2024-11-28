import pandas as pd
from pathlib import Path

def analyze_airdrops(input_folder):
    """
    Analyze all airdrop CSV files in a folder to display total tokens and unique addresses
    """
    folder = Path(input_folder)
    csv_files = list(folder.glob('*.csv'))
    
    if not csv_files:
        print(f"No CSV files found in {input_folder}")
        return
        
    # List to store all dataframes
    all_dfs = []
    
    # Process each CSV file
    print("\nProcessing individual files:")
    print("-" * 50)
    for file in csv_files:
        try:
            df = pd.read_csv(file)
            print(f"\nFile: {file.name}")
            print(f"Tokens: {df['quantity'].sum():,}")
            print(f"Addresses: {len(df):,}")
            print(f"Unique addresses: {df['address'].nunique():,}")
            all_dfs.append(df)
        except Exception as e:
            print(f"Error processing {file.name}: {str(e)}")
    
    if all_dfs:
        # Combine all dataframes
        combined_df = pd.concat(all_dfs, ignore_index=True)
        
        # Calculate overall totals
        total_tokens = combined_df['quantity'].sum()
        total_addresses = len(combined_df)
        unique_addresses = combined_df['address'].nunique()
        
        # Get distribution by collection
        collection_stats = combined_df.groupby('collection').agg({
            'quantity': 'sum',
            'address': 'nunique'
        }).reset_index()
        
        # Print overall summary
        print("\nOVERALL SUMMARY")
        print("-" * 50)
        print(f"Total CSV files processed: {len(csv_files)}")
        print(f"Total tokens airdropped: {total_tokens:,}")
        print(f"Total address entries: {total_addresses:,}")
        print(f"Total unique addresses: {unique_addresses:,}")
        
        print("\nBreakdown by collection:")
        print("-" * 50)
        for _, row in collection_stats.iterrows():
            print(f"\nCollection: {row['collection']}")
            print(f"Tokens: {row['quantity']:,}")
            print(f"Unique addresses: {row['address']:,}")

# Example usage
if __name__ == "__main__":
    input_folder = "./distribution/argent_braavos/"  # Replace with your folder path
    analyze_airdrops(input_folder)