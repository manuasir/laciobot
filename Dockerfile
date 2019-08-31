FROM arm32v7/node

ENV dburl ""
ENV NODE production
ENV TOKEN ""
# Create app directory
WORKDIR /usr/src/laciobot
 
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# RUN npm install
# If you are building your code for production
RUN npm install

# Bundle app source
COPY . .

CMD [ "node", "index.js" ]