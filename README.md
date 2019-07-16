# turing-backend
Turing ECommerce backend challenge

# Kubernetes Configuration
## Install helm (Package manager for [re]deploying API to kubernetes)
https://github.com/helm/helm/blob/master/docs/install.md

## Install ambassador (This is the router)
```helm install --wait --name ambassador -f ambassador-helm-values.yaml stable/ambassador```

## Install kubernetes-dashboard (This just make things easier when you get lost)
```helm install --wait --name k-dash stable/kubernetes-dashboard --set service.externalPort=8000,fullnameOverride='kubernetes-dashboard' --namespace=kube-system```

Run the kubernetes proxy: `kubectl proxy`
Access the dashboard: `http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:8000/proxy/`

## Install MySQL initialized with sql file (This will spin up the db and associated file with challenge)
### Windows Instructions
```
// Create the persistent storage volume with claim 'mysql-pv-claim'
mkdir data

// Update the mysql-pv.yaml file with the path to the data folder

// Install it in the cluster
kubectl apply -f mysql-pv.yaml

// Install MySql 8
helm install --wait --name mysql -f mysql-helm-values.yaml stable/mysql

// Check if tables are loaded in db shoppers using exec from either kubernetes dashboard or kubectl via kubectl exec -ti mysql-<id> mysql -- mysql -ppassword
// Run following command to fix bug with NodeJS mysql client
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'password';

// Build and install API
./buildAndInstall.sh
```