#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

EXPOSE 443
EXPOSE 44428

RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y libpng-dev libjpeg-dev curl libxi6 build-essential libgl1-mesa-glx
RUN curl -sL https://deb.nodesource.com/setup_lts.x | bash -
RUN apt-get install -y nodejs

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y libpng-dev libjpeg-dev curl libxi6 build-essential libgl1-mesa-glx
RUN curl -sL https://deb.nodesource.com/setup_lts.x | bash -
RUN apt-get install -y nodejs

WORKDIR /src
COPY ["ImListening/ImListening.csproj", "ImListening/"]
COPY ["Core.ImListening/Core.ImListening.csproj", "Core.ImListening/"]
COPY ["Common.ImListening/Common.ImListening.csproj", "Common.ImListening/"]
RUN dotnet restore "ImListening/ImListening.csproj"
COPY . .
WORKDIR "/src/ImListening"
RUN dotnet build "ImListening.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ImListening.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .


# Generate a self-signed certificate
RUN openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"

# Convert the certificate and key to a PFX file
RUN openssl pkcs12 -export -out certificate.pfx -inkey key.pem -in cert.pem -password pass:yourpassword

# Set environment variables to configure HTTPS
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_HOSTINGSTARTUPASSEMBLIES=Microsoft.AspNetCore.SpaProxy
ENV ASPNETCORE_URLS=https://+
ENV ASPNETCORE_HTTPS_PORT=443
ENV MONGO_DB_CONNECTION_STRING=mongodb://localhost:27017
ENV DATABASE_NAME=WebHooks
ENV MONGO_DB_ENABLE_COMMAND_TRACING=false
ENV IDENTITY_PROVIDER_AUTORITY=

ENV ASPNETCORE_Kestrel__Certificates__Default__Path=/app/certificate.pfx
ENV ASPNETCORE_Kestrel__Certificates__Default__Password=yourpassword


ENTRYPOINT ["dotnet", "ImListening.dll"]
