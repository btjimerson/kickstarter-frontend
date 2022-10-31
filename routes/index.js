const express = require('express');
const axios = require('axios').default;
const util = require('util').default;
const fs = require('fs');
const tmp = require('tmp');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/', function(req, res) {
  const application = {
      name: req.body.deploymentName,
      namespace: req.body.deploymentNamespace,
      containerName: req.body.deploymentName,
      containerImage: req.body.containerImage,
      containerPort: req.body.containerPort,
      containerImagePullPolicy: "Always",
      deploymentStrategy: "RollingUpdate",
      replicas: req.body.replicas,
      servicePort: req.body.servicePort
  }
  
  if (req.body.includeGatewayVirtualService) {
    application.includeGateway = true;
    application.gatewayPort = req.body.gatewayPort;
    application.gatewayPortName = req.body.gatewayPortName;
    application.host = req.body.gatewayHost;
    application.protocol = req.body.protocol;
    application.includeVirtualService = true;

    if (req.body.protocol == "HTTPS" || req.body.protocol == "TLS") {
      application.tlsMode = req.body.tlsMode;
      application.credentialName = req.body.credentialName;
    }
  }

  console.debug(application);

  axios({
    method: "post",
    url: process.env.KICKSTARTER_API_URI + "/application" || "http://localhost:8080/application",
    data: application
  }).then(response => {
    const tmpFile = tmp.fileSync();
    fs.writeFileSync(tmpFile.name, response.data);
    res.download(tmpFile.name, "application.yaml");
  }).catch(error => {
    console.log(error);
    res.status(500).send("Uh oh, something went wrong.  Please try again.");
  });

});

module.exports = router;
