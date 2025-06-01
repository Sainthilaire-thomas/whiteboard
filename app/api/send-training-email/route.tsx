// Fichier: app/api/send-training-email/route.ts

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, trainingPlan, theme, pdfBase64 } = await request.json();

    // Validation
    if (!email || !trainingPlan) {
      return NextResponse.json(
        { error: "Email et plan d'entraînement requis" },
        { status: 400 }
      );
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Adresse email invalide" },
        { status: 400 }
      );
    }

    // Template HTML pour l'email
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 30px 20px; 
            border-radius: 10px; 
            text-align: center; 
            margin-bottom: 30px;
          }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 10px 0 0 0; opacity: 0.9; }
          .info-box { 
            background: #f8f9ff; 
            border-left: 4px solid #667eea;
            padding: 20px; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
          .info-box h3 { margin-top: 0; color: #667eea; }
          .stats { 
            display: flex; 
            gap: 20px; 
            flex-wrap: wrap; 
            margin: 15px 0;
          }
          .stat { 
            background: white; 
            padding: 15px; 
            border-radius: 8px; 
            text-align: center; 
            min-width: 120px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .stat-number { 
            font-size: 24px; 
            font-weight: bold; 
            color: #667eea; 
            display: block; 
          }
          .stat-label { 
            font-size: 12px; 
            color: #666; 
            text-transform: uppercase; 
          }
          .step { 
            background: white;
            border: 1px solid #e1e5e9; 
            padding: 20px; 
            margin: 15px 0; 
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .step-header { 
            color: #667eea; 
            font-weight: bold; 
            font-size: 18px; 
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .step-dates { 
            color: #666; 
            font-size: 14px; 
            margin-bottom: 15px;
            background: #f8f9ff;
            padding: 8px 12px;
            border-radius: 4px;
            display: inline-block;
          }
          .step-content { 
            line-height: 1.6; 
          }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e1e5e9; 
            color: #666; 
            font-size: 14px; 
          }
          .theme-badge {
            background: #667eea;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
          }
          @media only screen and (max-width: 600px) {
            .stats { flex-direction: column; }
            .stat { min-width: auto; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎯 Votre Plan d'Entraînement</h1>
          <p>Parcours personnalisé généré pour vous</p>
          <span class="theme-badge">${getThemeName(theme)}</span>
        </div>

        <div class="info-box">
          <h3>📋 Informations Générales</h3>
          <div class="stats">
            <div class="stat">
              <span class="stat-number">${trainingPlan.totalDuration}</span>
              <span class="stat-label">Jours</span>
            </div>
            <div class="stat">
              <span class="stat-number">${trainingPlan.nudges.length}</span>
              <span class="stat-label">Étapes</span>
            </div>
            <div class="stat">
              <span class="stat-number">${Math.ceil(
                trainingPlan.totalDuration / 7
              )}</span>
              <span class="stat-label">Semaines</span>
            </div>
            <div class="stat">
              <span class="stat-number">${Math.round(
                trainingPlan.totalDuration / trainingPlan.nudges.length
              )}</span>
              <span class="stat-label">J/étape</span>
            </div>
          </div>
          <p><strong>📅 Période :</strong> Du ${new Date(
            trainingPlan.startDate
          ).toLocaleDateString("fr-FR")} au ${new Date(
      new Date(trainingPlan.startDate).getTime() +
        (trainingPlan.totalDuration - 1) * 24 * 60 * 60 * 1000
    ).toLocaleDateString("fr-FR")}</p>
        </div>

        <h3>🗺️ Détail de votre parcours</h3>
        ${trainingPlan.nudges
          .map(
            (nudge: any, index: number) => `
          <div class="step">
            <div class="step-header">
              ${getStepIcon(theme, index)} Étape ${nudge.nudgeNumber}: ${
              nudge.dayRange
            }
            </div>
            <div class="step-dates">
              📅 ${new Date(nudge.startDate).toLocaleDateString(
                "fr-FR"
              )} → ${new Date(nudge.endDate).toLocaleDateString("fr-FR")}
            </div>
            <div class="step-content">${nudge.content}</div>
          </div>
        `
          )
          .join("")}

        <div class="footer">
          <p>🌟 <strong>Bonne chance dans votre parcours d'entraînement !</strong></p>
          <p>Email généré le ${new Date().toLocaleDateString(
            "fr-FR"
          )} à ${new Date().toLocaleTimeString("fr-FR")}</p>
          <p style="font-size: 12px; color: #999;">
            Si vous avez des questions, n'hésitez pas à nous contacter.
          </p>
        </div>
      </body>
      </html>
    `;

    // Préparer les attachments si PDF fourni
    const attachments = [];
    if (pdfBase64) {
      attachments.push({
        filename: `plan-entrainement-${
          new Date().toISOString().split("T")[0]
        }.pdf`,
        content: pdfBase64,
      });
    }

    // Envoyer l'email
    const { data, error } = await resend.emails.send({
      from: "Plans d'Entraînement <onboarding@resend.dev>", // Utilisez resend.dev pour les tests
      to: [email],
      subject: `🎯 Votre Plan d'Entraînement - ${trainingPlan.totalDuration} jours`,
      html: emailHTML,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    if (error) {
      console.error("Erreur Resend:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }

    // Succès
    return NextResponse.json({
      success: true,
      messageId: data?.id,
      message: "Email envoyé avec succès !",
    });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

// Fonctions utilitaires
function getThemeName(theme: string): string {
  const themes: Record<string, string> = {
    default: "🎯 Parcours Classique",
    mountain: "🏔️ Ascension Montagne",
    train: "🚂 Voyage Express",
    roadtrip: "🛣️ Road Trip Aventure",
    orienteering: "🧭 Mission Exploration",
    desert: "🏜️ Traversée du Désert",
  };
  return themes[theme] || themes.default;
}

function getStepIcon(theme: string, index: number): string {
  const icons: Record<string, string[]> = {
    default: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣"],
    mountain: ["🥾", "⛰️", "🏔️", "🗻", "🏔️"],
    train: ["🚃", "🚋", "🚎", "🚌", "🚐"],
    roadtrip: ["🏛️", "🌊", "🏖️", "🏰", "🎡", "🌋", "🏞️"],
    orienteering: ["🎯", "🔍", "🗺️", "📊", "⚡"],
    desert: ["🐪", "🌴", "🏕️", "🌵", "💧", "🦎", "🏺"],
  };

  const themeIcons = icons[theme] || icons.default;
  return themeIcons[index % themeIcons.length];
}
