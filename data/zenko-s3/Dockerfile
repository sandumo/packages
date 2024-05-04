FROM zenko/cloudserver

WORKDIR /usr/src/app

COPY config.json config.json
COPY locationConfig.json locationConfig.json
COPY authdata.json conf/authdata.json
COPY replace-vars.sh replace-vars.sh

CMD ./replace-vars.sh && yarn start
