import pandas as pd
import os

# Install the Kaggle library
!pip install kaggle# To download datasets from Kaggle, you need to set up your Kaggle API credentials.
# You can generate a Kaggle API token from your Kaggle account (My Account -> API -> Create New API Token).
# Upload the 'kaggle.json' file (containing your username and key) to Colab's file system or set them as environment variables.
# For simplicity, we'll assume you set your Kaggle username and key directly as environment variables here.
# Replace 'YOUR_KAGGLE_USERNAME' and 'YOUR_KAGGLE_KEY' with your actual credentials.

# If you prefer to upload kaggle.json:
# from google.colab import files
# files.upload() # This will prompt you to upload the kaggle.json file
# !mkdir -p ~/.kaggle
# !mv kaggle.json ~/.kaggle/
# !chmod 600 ~/.kaggle/kaggle.json

# Or set environment variables directly:
os.environ['KAGGLE_USERNAME'] = 'YOUR_KAGGLE_USERNAME' # @param {type: "string"}
os.environ['KAGGLE_KEY'] = 'YOUR_KAGGLE_KEY' # @param {type: "string"}# Define the dataset path from Kaggle
kaggle_dataset_path = 'hassangasem/corporate-ai-adoption-and-roi-dataset-20152035'

# Create a directory to store the dataset
!mkdir -p ~/.kaggle

# Download the dataset
!kaggle datasets download -d {kaggle_dataset_path} -p './data'

# Unzip the downloaded file
!unzip -o './data/*.zip' -d './data'

print('Dataset downloaded and unzipped successfully!')# Load the CSV file into a pandas DataFrame
# We'll assume the main CSV file is named 'corporate_ai_adoption_and_roi_dataset.csv' within the 'data' directory.
# You might need to adjust the filename if it's different after unzipping.
csv_file_path = './data/corporate_ai_adoption_and_roi_dataset.csv'
df = pd.read_csv(csv_file_path)

# Display the first 5 rows of the DataFrame
display(df.head())# Display the column information to check data types and non-null counts
display(df.info())import os

# List the contents of the ./data directory to identify the correct CSV filename
print(os.listdir('./data'))csv_file_path = './data/corporate_ai_adoption_dataset.csv'
df = pd.read_csv(csv_file_path)

# Display the first 5 rows of the DataFrame
display(df.head())

# Display the column information to check data types and non-null counts
display(df.info())print('Descriptive Statistics:')
display(df.describe())

print('\nChecking for duplicate rows:')
duplicate_rows = df.duplicated().sum()
print(f'Number of duplicate rows: {duplicate_rows}')print('\nChecking for missing values:')
print(df.isnull().sum())

print('\nUnique values and their counts for categorical columns:')
for column in df.select_dtypes(include='object').columns:
    print(f'\nColumn: {column}')
    print(df[column].value_counts())
import matplotlib.pyplot as plt
import seaborn as sns

# Define key numerical columns for visualization, focusing on AI adoption and ROI metrics
key_numerical_cols = [
    'ai_adoption_level',
    'ai_investment_usd',
    'automation_rate',
    'cost_savings',
    'revenue_impact',
    'productivity_gain',
    'employee_ai_training_hours',
    'ai_maturity_score',
    'deployment_count'
]

# Set up the matplotlib figure and axes
fig, axes = plt.subplots(nrows=3, ncols=3, figsize=(18, 15))
axes = axes.flatten()

# Plot histogram for each key numerical column
for i, col in enumerate(key_numerical_cols):
    sns.histplot(df[col], kde=True, ax=axes[i])
    axes[i].set_title(f'Distribution of {col}')
    axes[i].set_xlabel(col)
    axes[i].set_ylabel('Frequency')

plt.tight_layout()
plt.show()plt.figure(figsize=(12, 10))
sns.heatmap(df[key_numerical_cols].corr(), annot=True, cmap='coolwarm', fmt='.2f')
plt.title('Correlation Matrix of Key Numerical Features')
plt.show()
import matplotlib.pyplot as plt
import seaborn as sns

# Visualize the distribution of categorical features: 'industry' and 'country'
plt.figure(figsize=(15, 6))
sns.countplot(data=df, y='industry', order = df['industry'].value_counts().index, palette='viridis', hue='industry', legend=False)
plt.title('Distribution of Industries')
plt.xlabel('Count')
plt.ylabel('Industry')
plt.show()

plt.figure(figsize=(15, 8))
sns.countplot(data=df, y='country', order = df['country'].value_counts().index, palette='plasma', hue='country', legend=False)
plt.title('Distribution of Countries')
plt.xlabel('Count')
plt.ylabel('Country')
plt.show()
plt.figure(figsize=(12, 6))
sns.countplot(data=df, x='year', palette='GnBu_d', hue='year', legend=False)
plt.title('Distribution of Data by Year')
plt.xlabel('Year')
plt.ylabel('Count')
plt.xticks(rotation=45)
plt.show()
import matplotlib.pyplot as plt
import seaborn as sns

# Group data by year and calculate the mean for key metrics
trend_data = df.groupby('year')[['ai_adoption_level', 'ai_investment_usd', 'cost_savings', 'revenue_impact']].mean().reset_index()

plt.figure(figsize=(16, 12))

# Plot AI Adoption Level over Time
plt.subplot(2, 2, 1)
sns.lineplot(data=trend_data, x='year', y='ai_adoption_level', marker='o')
plt.title('Average AI Adoption Level Over Time')
plt.xlabel('Year')
plt.ylabel('Average AI Adoption Level')
plt.grid(True)

# Plot AI Investment (USD) over Time
plt.subplot(2, 2, 2)
sns.lineplot(data=trend_data, x='year', y='ai_investment_usd', marker='o')
plt.title('Average AI Investment (USD) Over Time')
plt.xlabel('Year')
plt.ylabel('Average AI Investment (USD)')
plt.ticklabel_format(style='plain', axis='y') # Prevent scientific notation
plt.grid(True)

# Plot Cost Savings over Time
plt.subplot(2, 2, 3)
sns.lineplot(data=trend_data, x='year', y='cost_savings', marker='o')
plt.title('Average Cost Savings Over Time')
plt.xlabel('Year')
plt.ylabel('Average Cost Savings')
plt.ticklabel_format(style='plain', axis='y')
plt.grid(True)

# Plot Revenue Impact over Time
plt.subplot(2, 2, 4)
sns.lineplot(data=trend_data, x='year', y='revenue_impact', marker='o')
plt.title('Average Revenue Impact Over Time')
plt.xlabel('Year')
plt.ylabel('Average Revenue Impact')
plt.ticklabel_format(style='plain', axis='y')
plt.grid(True)

plt.tight_layout()
plt.show()
import matplotlib.pyplot as plt
import seaborn as sns

# Calculate Return on Investment (ROI)
# A common way to calculate ROI: (Revenue Impact + Cost Savings - AI Investment) / AI Investment
df['return_on_investment'] = (df['revenue_impact'] + df['cost_savings'] - df['ai_investment_usd']) / df['ai_investment_usd']

print('Descriptive statistics for Return on Investment:')
display(df['return_on_investment'].describe())

# Visualize the distribution of the new ROI feature
plt.figure(figsize=(10, 6))
sns.histplot(df['return_on_investment'], kde=True, bins=50)
plt.title('Distribution of Return on Investment')
plt.xlabel('Return on Investment')
plt.ylabel('Frequency')
plt.grid(True)
plt.show()from sklearn.model_selection import train_test_split

# Define features (X) and target (y)
X = df.drop(columns=['return_on_investment'])
y = df['return_on_investment']

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Shape of X_train: {X_train.shape}")
print(f"Shape of X_test: {X_test.shape}")
print(f"Shape of y_train: {y_train.shape}")
print(f"Shape of y_test: {y_test.shape}")from sklearn.ensemble import RandomForestRegressor

# Initialize the Random Forest Regressor model
model = RandomForestRegressor(random_state=42)

# Train the model on the training data
model.fit(X_train, y_train)

# Evaluate the model on the training set
train_score = model.score(X_train, y_train)
print(f"R-squared score on the training set: {train_score:.4f}")test_score = model.score(X_test, y_test)
print(f"R-squared score on the test set: {test_score:.4f}")import matplotlib.pyplot as plt
import seaborn as sns

# Get feature importances from the trained model
feature_importances = model.feature_importances_

# Create a DataFrame for better visualization
features_df = pd.DataFrame({
    'Feature': X.columns,
    'Importance': feature_importances
})

# Sort features by importance
features_df = features_df.sort_values(by='Importance', ascending=False)

# Display the top 10 most important features
print("Top 10 Most Important Features:")
display(features_df.head(10))

# Plot feature importances
plt.figure(figsize=(12, 8))
sns.barplot(x='Importance', y='Feature', data=features_df.head(20))
plt.title('Top 20 Feature Importances in Random Forest Model')
plt.xlabel('Importance')
plt.ylabel('Feature')
plt.grid(axis='x', linestyle='--')
plt.tight_layout()
plt.show()from sklearn.preprocessing import StandardScaler

# Select features relevant for recommendation system, excluding 'return_on_investment'
# We want to cluster companies based on their AI adoption, investment, performance metrics, etc.
features_for_recommendation = [
    'ai_adoption_level', 'ai_investment_usd', 'automation_rate', 'cost_savings',
    'revenue_impact', 'productivity_gain', 'employee_ai_training_hours',
    'ai_maturity_score', 'deployment_count', 'ai_age',
    'investment_adoption_interaction', 'investment_maturity_interaction'
] + list(df.filter(regex='^industry_').columns) + list(df.filter(regex='^country_').columns)

X_recommendation = df[features_for_recommendation]

# Scale the features
scaler = StandardScaler()
X_recommendation_scaled = scaler.fit_transform(X_recommendation)

# Convert back to DataFrame for easier inspection, keeping column names
X_recommendation_scaled = pd.DataFrame(X_recommendation_scaled, columns=X_recommendation.columns)

print("Scaled features for recommendation system (first 5 rows):")
display(X_recommendation_scaled.head())
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

# Determine the optimal number of clusters using the Elbow Method
wcss = []
for i in range(1, 11): # Test 1 to 10 clusters
    kmeans = KMeans(n_clusters=i, init='k-means++', random_state=42, n_init=10)
    kmeans.fit(X_recommendation_scaled)
    wcss.append(kmeans.inertia_)

# Plot the Elbow Method graph
plt.figure(figsize=(10, 6))
plt.plot(range(1, 11), wcss, marker='o', linestyle='--')
plt.title('Elbow Method to Determine Optimal Number of Clusters')
plt.xlabel('Number of Clusters')
plt.ylabel('WCSS (Within-Cluster Sum of Squares)')
plt.grid(True)
plt.show()

print("WCSS values for 1 to 10 clusters:")
for i, val in enumerate(wcss):
    print(f"Cluster {i+1}: {val:.2f}")n_clusters = 4 # Based on the elbow method plot
kmeans = KMeans(n_clusters=n_clusters, init='k-means++', random_state=42, n_init=10)
cluster_labels = kmeans.fit_predict(X_recommendation_scaled)

# Add the cluster labels to the original DataFrame
df['recommendation_cluster'] = cluster_labels

print(f"K-Means model trained with {n_clusters} clusters.")
print("First 5 rows of DataFrame with new 'recommendation_cluster' column:")
display(df.head())cluster_analysis = df.groupby('recommendation_cluster')[features_for_recommendation].mean()
print("Cluster Analysis (Mean of features per cluster):")
display(cluster_analysis)
import matplotlib.pyplot as plt
import seaborn as sns

# Select a subset of key features for visualization to keep the plots readable
visual_features = [
    'ai_adoption_level',
    'ai_investment_usd',
    'automation_rate',
    'cost_savings',
    'revenue_impact',
    'productivity_gain',
    'employee_ai_training_hours',
    'ai_maturity_score',
    'deployment_count'
]

# Prepare the data for plotting
plot_data = cluster_analysis[visual_features].reset_index()

# Create subplots for each feature
fig, axes = plt.subplots(nrows=3, ncols=3, figsize=(20, 18))
axes = axes.flatten()

for i, feature in enumerate(visual_features):
    sns.barplot(x='recommendation_cluster', y=feature, data=plot_data, ax=axes[i], palette='viridis')
    axes[i].set_title(f'Mean {feature} by Cluster')
    axes[i].set_xlabel('Recommendation Cluster')
    axes[i].set_ylabel(f'Mean {feature}')
    axes[i].ticklabel_format(style='plain', axis='y') # Ensure readable numbers for currency/large values

plt.tight_layout()
plt.show()
import matplotlib.pyplot as plt
import seaborn as sns

# Select a subset of key features for visualization to keep the plots readable
visual_features = [
    'ai_adoption_level',
    'ai_investment_usd',
    'automation_rate',
    'cost_savings',
    'revenue_impact',
    'productivity_gain',
    'employee_ai_training_hours',
    'ai_maturity_score',
    'deployment_count'
]

# Prepare the data for plotting
plot_data = cluster_analysis[visual_features].reset_index()

# Create subplots for each feature
fig, axes = plt.subplots(nrows=3, ncols=3, figsize=(20, 18))
axes = axes.flatten()

for i, feature in enumerate(visual_features):
    sns.barplot(x='recommendation_cluster', y=feature, data=plot_data, ax=axes[i], palette='viridis', hue='recommendation_cluster', legend=False)
    axes[i].set_title(f'Mean {feature} by Cluster')
    axes[i].set_xlabel('Recommendation Cluster')
    axes[i].set_ylabel(f'Mean {feature}')
    axes[i].ticklabel_format(style='plain', axis='y') # Ensure readable numbers for currency/large values

plt.tight_layout()
plt.show()from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np

# Make predictions on the test set
y_pred = model.predict(X_test)

# Calculate additional regression metrics
mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)

print(f"\nROI Prediction Model Evaluation on Test Set:")
print(f"R-squared: {model.score(X_test, y_test):.4f}")
print(f"Mean Absolute Error (MAE): {mae:.4f}")
print(f"Mean Squared Error (MSE): {mse:.4f}")
print(f"Root Mean Squared Error (RMSE): {rmse:.4f}")from sklearn.metrics import silhouette_score

# Calculate the Silhouette Score for the K-Means clustering
silhouette_avg = silhouette_score(X_recommendation_scaled, cluster_labels)

print(f"\nSilhouette Score for K-Means Clustering: {silhouette_avg:.4f}")def generate_recommendations(company_cluster_id, predicted_roi, cluster_analysis, roi_prediction_model=None, company_data=None):
    """
    Generates tailored business recommendations based on a company's cluster and predicted ROI.

    Args:
        company_cluster_id (int): The K-Means cluster ID for the company.
        predicted_roi (float): The predicted Return on Investment for the company.
        cluster_analysis (pd.DataFrame): DataFrame containing the mean features for each cluster.
        roi_prediction_model: (Optional) The trained ROI prediction model.
        company_data (pd.Series): (Optional) A Series containing the company's feature data for actual prediction.

    Returns:
        list: A list of tailored recommendations.
    """
    recommendations = []

    # Get the average profile of the company's cluster
    cluster_profile = cluster_analysis.loc[company_cluster_id]

    # General ROI prediction model insights (from feature importances)
    if predicted_roi < 0:
        recommendations.append("Your predicted ROI is currently negative. Focus on core revenue-generating AI projects and cost-saving initiatives.")
    elif predicted_roi < 0.2:
        recommendations.append("Your predicted ROI is modest. Consider optimizing existing AI projects and explore new high-impact areas.")
    else:
        recommendations.append("Your predicted ROI is strong! Maintain momentum and explore scaling successful AI initiatives.")

    # Tailored recommendations based on cluster profile
    if company_cluster_id == 0:  # Emerging Adopters
        recommendations.append(
            "As an Emerging Adopter, consider increasing strategic AI investment in proven revenue-generating or cost-saving applications. "
            "Boost employee AI training to improve AI maturity scores and move towards higher-performing clusters."
        )
        if cluster_profile['employee_ai_training_hours'] < 80:
            recommendations.append("Specifically, target increased employee AI training hours to build internal capabilities.")

    elif company_cluster_id == 1:  # High-Growth AI Leaders
        recommendations.append(
            "As a High-Growth AI Leader, maintain your aggressive AI strategy, focusing on continuous innovation and exploring frontier AI technologies. "
            "Consider sharing best practices internally or externally to solidify your market position."
        )
        if cluster_profile['ai_maturity_score'] < 8.0:
            recommendations.append("Even as a leader, there's always room to refine: focus on continuous improvement of your AI maturity score.")

    elif company_cluster_id == 2:  # Cautious Explorers
        recommendations.append(
            "As a Cautious Explorer, review your substantial AI investments to ensure they are aligned with clear strategic goals. "
            "Increase employee AI training and focus on practical deployment to translate investment into tangible ROI and increase AI adoption levels."
        )
        if cluster_profile['ai_adoption_level'] < 0.4:
            recommendations.append("Prioritize initiatives that directly increase AI adoption and integration across your operations.")

    elif company_cluster_id == 3:  # Intermediate Performers
        recommendations.append(
            "As an Intermediate Performer, analyze specific areas where you can scale up your AI initiatives. "
            "Optimize current deployments, explore advanced AI applications, or expand your AI training programs to achieve the performance levels of High-Growth AI Leaders."
        )
        if cluster_profile['productivity_gain'] < 0.5:
            recommendations.append("Focus on optimizing AI applications to drive higher productivity gains.")

    # Add a general recommendation based on top feature importances
    recommendations.append(
        "Always prioritize AI initiatives with clear potential for revenue impact and significant cost savings, as these are the strongest drivers of ROI."
    )

    return recommendations

# Example Usage (assuming a company has been clustered and its ROI predicted)
# Let's take the first company in the dataset as an example
example_company_id = 0
example_cluster = df.loc[example_company_id, 'recommendation_cluster']
example_predicted_roi = y_pred[example_company_id] # Assuming y_pred was generated for the test set, needs mapping to original df index or predicting a specific company's ROI

# For simplicity, let's just pick a random cluster and a dummy predicted ROI for demonstration
dummy_cluster_id = 1 # Example: High-Growth AI Leaders
dummy_predicted_roi = 0.5 # Example: High ROI

print(f"Recommendations for a company in Cluster {dummy_cluster_id} with predicted ROI of {dummy_predicted_roi:.2f}:")
recs = generate_recommendations(dummy_cluster_id, dummy_predicted_roi, cluster_analysis)
for i, rec in enumerate(recs):
    print(f"{i+1}. {rec}")

dummy_cluster_id_2 = 2 # Example: Cautious Explorers
dummy_predicted_roi_2 = -0.1 # Example: Negative ROI

print(f"\nRecommendations for a company in Cluster {dummy_cluster_id_2} with predicted ROI of {dummy_predicted_roi_2:.2f}:")
recs_2 = generate_recommendations(dummy_cluster_id_2, dummy_predicted_roi_2, cluster_analysis)
for i, rec in enumerate(recs_2):
    print(f"{i+1}. {rec}")
