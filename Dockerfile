FROM node
EXPOSE 443
COPY ./src/ /
RUN ls -laR src/
RUN npm install 
CMD ["npm",  "start"]
