<p>Production status</p>
<a href="https://circleci.com/gh/lewnelson/netlify-gatsby-demo" target="_blank" title="CircleCI Production Status">
  <img src="https://circleci.com/gh/lewnelson/netlify-gatsby-demo/tree/master.svg?style=svg" alt="CircleCI Production Status" />
</a>
<p>Staging status</p>
<a href="https://circleci.com/gh/lewnelson/netlify-gatsby-demo/tree/staging" target="_blank" title="CircleCI Staging Status">
  <img src="https://circleci.com/gh/lewnelson/netlify-gatsby-demo/tree/staging.svg?style=svg" alt="CircleCI Staging Status" />
</a>
<a href="https://app.netlify.com/sites/romantic-spence-daddaa/deploys" target="_blank" title="Netlify Staging Status">
  <img src="https://api.netlify.com/api/v1/badges/c1c8f9d4-5213-4e73-8032-2d2f829bfd88/deploy-status" alt="Netlify Staging Status" />
</a>
<p align="center">
  <a href="https://www.gatsbyjs.org">
    <img alt="Gatsby" src="https://www.gatsbyjs.org/monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  Gatsby Netlify starter with CircleCI and GitHub pages
</h1>

Kick off your project with this default boilerplate. This starter ships with the default Gatsby starter as well as some CircleCI configuration and Netlify setup.

The workflow for this boilerplate is to deploy production sites to GitHub pages and use Netlify for a staging environment.

_Have another more specific idea? You may want to check out our vibrant collection of [official and community-created starters](https://www.gatsbyjs.org/docs/gatsby-starters/)._

## First things first

### Linking Netlify

You'll need to link the git project on your Netlify CMS account in order for this to work. From there you'll need to enable Git Gateway for authentication.

You'll also need to update the build and deploy settings:
* The build command needs to be set to `npm run build` or `gatsby build`
* The publish directory should be `public/`
* The production branch should be set to `staging`
* Set deploy previews to whatever you wish
* Only allow deploys on the production branch

### Linking CircleCI

Create a CircleCI account and link it with GitHub. You can then choose what repositories CircleCI can monitor. You'll also want to navigate to the VCS settings and allow GitHub to manage checks. This means you will see the status of the CI jobs on pull requests.

Lastly as we are deploying to GitHub pages we'll need to allow CircleCI write access to our repo. You can do this in the project settings in CircleCI and add the private key you will use in your CI environment. If you are having issues uploading the private key ensure you create your key using this command:
```
ssh-keygen -f ~/.ssh/circleci_writeable -C "CircleCI writeable" -m PEM -t rsa
```
feel free to change the path and context.

### GitHub repo settings

* Add the deployment key from the public key generated when creating the key pair used on CircleCI
* Set the default branch to staging
* Add a rule to protect the master branch as well as the staging branch

### Update CircleCI config.yml

```
.circleci/config.yml
```
* Change the SSH key fingerprint in the deployment job to match the fingerprint of the key pair you created above for deployments to GitHub pages.
* Update the username and email in the git configuration to something appropriate

### GitHub pages setup

The `CNAME` file lives inside `static/CNAME` this is used for GitHub pages DNS records. Update accordingly. If you wish to use the `<username>.github.io/<repo>` URL instead of a custom domain some extra configuration will be required.

## After setup

Hopefully now you have everything setup. You can now visit the staging site hosted on Netlify and visit the `/admin` page to access the CMS. Any updates you publish will be reflected on the `staging` branch. Once you are happy with the changes create a pull request from staging -> master. Once the build has passed merge the PR. This will trigger a production build on CircleCI which will deploy to GitHub pages. As part of the deployment process the `/admin` folder is omitted meaning the CMS is unavailable in production.

Any features etc. can be branched from staging and merged via PR's to staging resulting in the Netlify staging branch updating and presuming you allow deployments for PR's you will also get sites for each PR you create hosted on Netlify.

## Testing

This boilerplate includes unit testing using Jest. Any files following the `*.test.js` naming convention will be run on `npm test`.
