# A Very Good Web App - WaterApi

![WaterAPI Icon](./docs/redoc/img/icon-water.svg)

Prerequisites
- [An AWS Account with programmatic permission](https://aws.amazon.com/)
- [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)
- A [Gatsby](https://gatsbyjs.com/) Cloud Account

## Project Description

This is a the back-end api for [averygoodweb.app](https://averygoodweb.app).

**WaterApiStack** is declared in the [averygoodwebapp-infrastructure](https://github.com/averygoodidea/averygoodwebapp-infrastructure) repo.

It is an AWS Lambda, written in JavaScript, and runs in a NodeJS environment.

## Local Development

#### Initialize Repo

1. Inside this repo, install the project node modules:

```
npm install
```

**Since this repo uses nvm v13 or higher. If there is any trouble running the repo, simply run the following command:**

`nvm use` and then re-run `npm install`

2. Update the WaterApi `.env.production` file with the following credentials:

| variable           | value                                        | description                                                                                                                                                                                                                     |
|--------------------|----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| AWS_WATERAPI_EMAIL | `<awsWaterApiEmail>`                         | an admin email for your project                                                                                                                                                                                                 |
| DOMAIN_NAME        | `<domainName>`                               | this project's domain name                                                                                                                                                                                                      |
| AWS_WATERAPI_KEY   | `<domainNamespaceEnvironmentAwsWaterApiKey>` | the water api key which you can copy and paste from: https://console.aws.amazon.com/cloudformation/home `<domainNamespace>`-`<environment>`-stack > Outputs. Copy the "apikey" generated from the url located at awsWaterApiKey |

3. Initialize the WaterApi codebase

```
sh ./scripts/init.sh <environment> <awsProfile>
```

4. For all subsequent development, the best way to develop the api is to, iteratively

- - 1. write your code locally and then deploy to the remote environment,
- - 2. invoke the api using a tool like [PAW](https://paw.cloud/), and then
- - 3. utilize [AWS CloudWatch](https://console.aws.amazon.com/cloudwatch/home) to analyze your logs.

To deploy your updates, run the following command:

```
sh ./scripts/deploy.sh <environment> <awsProfile>
```

### Tests

Jest Tests can be run by the following command:
```
npm run test:units
npm run test:integrations -- --environment=<environment>
```

Swagger API Documentation instructions are located at [./docs/README.md](./docs/)
