import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tokenParam = searchParams.get("token");
  const folderIdParam = searchParams.get("folderId");

  if (!tokenParam) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const token = JSON.parse(decodeURIComponent(tokenParam));
  const folderId = folderIdParam || "ly5m40e0e2d4ae7604a1fa0f5d42905cb94c9";

  try {
    // Configurations de headers à tester
    const headerConfigurations = [
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${token.access_token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        name: "JSON Basic",
      },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${token.access_token}`,
          "Content-Type": "application/vnd.api+json",
          Accept: "application/vnd.api+json",
        },
        name: "JSON:API",
      },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${token.access_token}`,
        },
        name: "Minimal Headers",
      },
    ];

    // Domaines et endpoints à tester
    const baseUrls = [
      token.api_domain || "https://www.zohoapis.com",
      "https://workdrive.zoho.com",
      `https://workdrive.${token.api_domain?.split(".")[1] || "zoho.com"}`,
    ];

    const endpointTemplates = [
      (baseUrl: string, folderId: string) =>
        `${baseUrl}/workdrive/api/v1/files/${folderId}/files`,
      (baseUrl: string, folderId: string) =>
        `${baseUrl}/workdrive/api/v1/files/${folderId}`,
      (baseUrl: string, folderId: string) =>
        `${baseUrl}/api/v1/files/${folderId}/files`,
      (baseUrl: string, folderId: string) =>
        `${baseUrl}/api/v1/files/${folderId}`,
    ];

    const queryParams = ["", "?page=1", "?page=1&limit=50"];

    let successfulAttempt = null;

    // Test de toutes les combinaisons
    for (const baseUrl of baseUrls) {
      for (const endpointTemplate of endpointTemplates) {
        for (const headerConfig of headerConfigurations) {
          for (const queryParam of queryParams) {
            const endpoint = `${endpointTemplate(
              baseUrl,
              folderId
            )}${queryParam}`;

            try {
              const response = await fetch(endpoint, {
                method: "GET",
                headers: headerConfig.headers,
              });

              const responseText = await response.text();

              let data;
              try {
                data = JSON.parse(responseText);
              } catch (e) {
                console.error("❌ JSON Parsing Error:", e);
                data = { text: responseText };
              }

              // Critères de succès plus larges
              if (
                (data.data && data.data.length > 0) ||
                (Array.isArray(data) && data.length > 0)
              ) {
                successfulAttempt = {
                  endpoint,
                  headerConfig: headerConfig.name,
                  response: data,
                };
                break;
              }
            } catch (fetchError) {
              console.error(`🚨 Fetch Error for ${endpoint}:`, fetchError);
            }
          }

          if (successfulAttempt) break;
        }

        if (successfulAttempt) break;
      }

      if (successfulAttempt) break;
    }

    if (!successfulAttempt) {
      return NextResponse.json(
        {
          error: "No data found with any of the attempted configurations",
          details: {
            baseUrls,
            folderId,
            headerConfigurations: headerConfigurations.map((c) => c.name),
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Successful data retrieval",
      endpoint: successfulAttempt.endpoint,
      headerConfig: successfulAttempt.headerConfig,
      data: successfulAttempt.response,
    });
  } catch (error) {
    console.error("🔥 Test API Global Error:", error);
    return NextResponse.json(
      {
        error: "Test API error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
