import pandas as pd
import statsmodels.api as sm
from scipy import stats

# Data
data = {
    'Year': list(range(1990, 2014)),
    'National_Leaders': [7.6, 8.1, 8.1, 8.3, 7.6, 6.6, 5.6, 5, 4.2, 3.8, 3.9, 4.1, 4.3, 4.3, 4.1, 4.3, 4.4, 4.1, 3.9, 3.6, 3.5, 3.5, 3.5, 3.3],
    'National_Failures': [5.9, 6.6, 6.4, 7, 6.9, 6.3, 5.7, 5.5, 4.9, 4.6, 4.5, 4.7, 4.6, 4.5, 4.4, 4.6, 4.8, 4.7, 4.8, 4.2, 4.1, 4.2, 4.4, 4.2]
}

# Create DataFrame
df = pd.DataFrame(data)

# Perform linear regression for National_Leaders
X_leaders = sm.add_constant(df['Year'])
model_leaders = sm.OLS(df['National_Leaders'], X_leaders).fit()
slope_leaders = model_leaders.params[1]

# Perform linear regression for National_Failures
X_failures = sm.add_constant(df['Year'])
model_failures = sm.OLS(df['National_Failures'], X_failures).fit()
slope_failures = model_failures.params[1]

# Print slopes
print(f"Slope of National_Leaders: {slope_leaders}")
print(f"Slope of National_Failures: {slope_failures}")

# Compare slopes using t-test
n = len(df)
se_leaders = model_leaders.bse[1]
se_failures = model_failures.bse[1]
t_stat = (slope_leaders - slope_failures) / ((se_leaders**2 + se_failures**2)**0.5)
df_t = n - 2
p_value = 2 * (1 - stats.t.cdf(abs(t_stat), df_t))

# Print comparison results
print(f"t-statistic: {t_stat}")
print(f"p-value: {p_value}")