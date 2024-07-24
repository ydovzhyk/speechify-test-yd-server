# Use an official Node.js runtime as a parent image
FROM node

# Set the working directory
WORKDIR /app

# Copy the rest of the application code
COPY . .

# Install dependencies
RUN npm install

# Expose the port the app runs on
EXPOSE 8080:8080

# Define the command to run the app
CMD [ "node", "server.js" ]