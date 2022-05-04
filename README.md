# uk-gov-stw-poc

UK Government Single Trade Window PoC

# CLEO

### Prerequisites

- Tested with Node 14 and 16
- docker (for containerisation)
- kubectl 1.21+
- aws cli

### Local

#### System

Open a terminal and cd into client. Run `npm install` and then `npm run dev` web application will run in hot reload letting you to make sure changes and see it be reflected

Open a new terminal and cd into server, Run `npm install` and then `npm run start`

The web application can be accessed at localhost:3000

#### Docker

Go to the client directory and run `docker build . -t cds-client`. The command will build an image from the Dockerfile and gives it a tag of cds-client

Got to the server directory and run `docker build . -t cds-server`.

After the images have been built you can do `docker images` to verify the images are there. To run the images do `docker run -p PORT:PORT tag` e.g `docker run -p 3000:3000 cds-client`. The first `<PORT>` value specifies the port docker should use on the machine and the second `<PORT>` is the expose port in the container.

##### Useful Docker Command

- docker login (Login to a docker repository)
- docker exec -it <CONTAINER_ID> sh (enter container)
- docker logs <CONTAINER_ID>
- docker tag <LOCAL_TAG> <REPOSITORY_TAG>
- docker push <IMAGE\_>

#### Cloud

I will be going through deploying CLEO on AWS EKS

First, create a cluster in EKS and follow the instructions. It will ask for you to create a role, add the policies it says to add.

While it is being created go to IAM console -> Dashboard -> My Security Credentials -> Access Keys -> Create New Access Key. Save the **ACCESS KEY ID** and **ACCESS KEY SECRET**.

Open terminal and run `aws configure`. Follow the instructions and provide your access keys.

If that goes well when you run `aws sts get-caller-identity`. The output should be something like

    {
    	"UserId": "xxxxxxxxxxxx",
    	"Account": "xxxxxxxxxxxx",
    	"Arn": "arn:aws:iam::xxxxxxxxxxxx:root"

    }

Now run `aws eks --region <CLUSTER_REGION> update-kubeconfig --name <CLUSTER_NAME>`

The command will create a kube config file which kubectl will use to connect to our cluster.

Once that runs verify it works by running `kubectl get svc`. Output should be like

NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE

kubernetes ClusterIP 10.100.0.1 `<none>` 443/TCP 4h12m

Now you are connected to the cluster.

Under Compute -> Create new Node Group. Follow the instructions to creating a group and create a role that they ask and add all the policies they mention.

Once that has been created you can now deploy the application.

However, before deploying setup 2 repositories (cds-server and cds-client) and push the images to aws. Follow the instructions. The repositories can be found under Amazon ECR

Edit kubernetes-deployment.yaml and replace the image with your aws image urls. Update the any other values if needed such as ports.

Edit kubernetes-service.yaml and update if needed

##### Deploy

To deploy the application run `kubectl apply -f kubernetes-deployment.yaml` and `kubectl apply -f kubernetes-service.yaml`. The pods should be created and running. Check with `kubectl get all` or `kubectl get pods`

`kubectl get all` should give you the external-ip that the application is running on.

You may need to update the url in client/api/conversation.tsx

##### Useful Commands

- kubectl delete ...... (delete pods, deployments, namespace and etc)
- kubectl get pods
- kubectl logs <PODS_NAME>
- kubectl version --short --client
- kubectl describe pod
- kubectl get nodes
