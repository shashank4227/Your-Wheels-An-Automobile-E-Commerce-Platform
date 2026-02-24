FROM node:18

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production=false

# Copy the rest of the application code
COPY . .

# Exclude files and directories from the image
RUN echo "node_modules\ndist\n.git\nDockerfile\ndocker-compose.yml" > .dockerignore

# Expose the port your app runs on
EXPOSE 5173

# Start the application with --host to expose it
CMD ["npm", "run", "dev", "--", "--host"]