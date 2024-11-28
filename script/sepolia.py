import os
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta

def transform_csv_files(input_folder, total_tokens=500, min_tokens=2):
    """
    Transform CSV files:
    - If file has 'quantity' column: preserve those values
    - If file has 'points' column: calculate new quantities with minimum 2
    Ensures no negative values in output
    """
    folder = Path(input_folder)
    future_date = datetime.now() + timedelta(days=10)
    future_timestamp = int(future_date.timestamp())
    
    # Process each CSV file
    for file in folder.glob('*.csv'):
        try:
            # Read input CSV
            df = pd.read_csv(file)
            collection_name = file.stem
            
            # Print columns for debugging
            print(f"\nColumns in {file.name}:", df.columns.tolist())
            
            # More robust column check
            has_quantity = any(col.strip().lower() == 'quantity' for col in df.columns)
            has_points = any(col.strip().lower() == 'points' for col in df.columns)
            
            print(f"Has quantity column: {has_quantity}")
            print(f"Has points column: {has_points}")
            
            if has_quantity:
                print(f"\nProcessing {file.name} (preserving existing quantities)")
                
                # Get the actual quantity column name (preserving original case)
                quantity_col = next(col for col in df.columns if col.strip().lower() == 'quantity')
                
                # Keep original structure, just ensure all required columns exist
                new_df = pd.DataFrame({
                    'address': df['address'],
                    'quantity': df[quantity_col],  # Use the original column name
                    'collection': collection_name,
                    'expiration_timestamp': future_timestamp
                })
                
            elif has_points:
                print(f"\nProcessing {file.name} (calculating quantities from points)")
                
                # Ensure points are non-negative
                df['points'] = df['points'].clip(lower=0)
                total_points = df['points'].sum()
                
                if total_points > 0:
                    # Calculate proportional distribution
                    num_addresses = len(df)
                    available_tokens = total_tokens - (num_addresses * min_tokens)
                    
                    if available_tokens < 0:
                        print(f"Warning: Not enough tokens to distribute. Setting all to minimum ({min_tokens})")
                        quantities = np.full(len(df), min_tokens, dtype=int)
                    else:
                        # Calculate proportional quantities and round to integers
                        extra_quantities = (df['points'] / total_points * available_tokens).round().astype(int)
                        quantities = extra_quantities + min_tokens
                else:
                    print("Warning: Total points is 0. Setting all quantities to minimum.")
                    quantities = np.full(len(df), min_tokens, dtype=int)
                
                new_df = pd.DataFrame({
                    'address': df['address'],
                    'quantity': quantities,
                    'collection': collection_name,
                    'expiration_timestamp': future_timestamp
                })
            else:
                print(f"Warning: {file.name} has neither 'quantity' nor 'points' columns. Skipping.")
                continue
            
            # Final safety check to ensure no negative values
            new_df['quantity'] = new_df['quantity'].clip(lower=min_tokens)
            
            # Print statistics
            print(f"Distribution stats for {collection_name}:")
            print(f"Total addresses: {len(new_df)}")
            print(f"Total tokens distributed: {new_df['quantity'].sum()}")
            print(f"Average tokens per address: {new_df['quantity'].mean():.1f}")
            print(f"Max tokens: {new_df['quantity'].max()}")
            print(f"Min tokens: {new_df['quantity'].min()}")
            
            # Save to CSV
            output_filename = f"transformed_{collection_name}.csv"
            new_df.to_csv(output_filename, index=False)
            print(f"Created {output_filename}")
            
        except Exception as e:
            print(f"Error processing {file.name}: {str(e)}")

# Example usage
if __name__ == "__main__":
    input_folder = "./output/all/playtests/first"  # Current directory, modify as needed
    transform_csv_files(input_folder, total_tokens=350, min_tokens=2)