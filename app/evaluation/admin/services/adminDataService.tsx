// app/evaluation/admin/services/adminDataService.ts
import { supabaseClient } from "@/lib/supabaseClient";
import {
  Entreprise,
  DomaineQualite,
  Sujet,
  PonderationSujet,
  CategoriesujetExtended,
  Pratique,
  SujetPratique,
  CategoriePratique,
} from "../types/admin";

export class AdminDataService {
  private supabase = supabaseClient;

  // ===== ENTREPRISES =====
  async loadEntreprises(): Promise<Entreprise[]> {
    const { data, error } = await this.supabase
      .from("entreprises")
      .select("identreprise, nomentreprise, logo, domaine, created_at")
      .order("nomentreprise");

    if (error) throw error;
    return data || [];
  }

  async createEntreprise(entreprise: Partial<Entreprise>): Promise<Entreprise> {
    const { data, error } = await this.supabase
      .from("entreprises")
      .insert([entreprise])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEntreprise(
    id: number,
    entreprise: Partial<Entreprise>
  ): Promise<Entreprise> {
    const { data, error } = await this.supabase
      .from("entreprises")
      .update(entreprise)
      .eq("identreprise", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEntreprise(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("entreprises")
      .delete()
      .eq("identreprise", id);

    if (error) throw error;
  }

  // ===== DOMAINES QUALITÉ =====
  async loadAllDomainesQualite(): Promise<DomaineQualite[]> {
    const { data, error } = await this.supabase
      .from("domaines")
      .select("*")
      .order("nomdomaine");

    if (error) throw error;
    return data || [];
  }

  async loadDomainesQualiteForEntreprise(
    entrepriseId: number
  ): Promise<DomaineQualite[]> {
    // Charger les grilles qualité liées à cette entreprise
    const { data: entrepriseDomainesData, error: entrepriseDomainesError } =
      await this.supabase
        .from("entreprise_domaines")
        .select("iddomaine")
        .eq("identreprise", entrepriseId);

    if (entrepriseDomainesError) throw entrepriseDomainesError;

    const domaineIds = (entrepriseDomainesData || []).map((ed) => ed.iddomaine);

    if (domaineIds.length > 0) {
      const { data: domainesData, error: domainesError } = await this.supabase
        .from("domaines")
        .select("*")
        .in("iddomaine", domaineIds)
        .order("nomdomaine");

      if (domainesError) throw domainesError;
      return domainesData || [];
    }

    return [];
  }

  async createDomaineQualite(
    domaine: Partial<DomaineQualite>
  ): Promise<DomaineQualite> {
    const { data, error } = await this.supabase
      .from("domaines")
      .insert([domaine])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDomaineQualite(
    id: number,
    domaine: Partial<DomaineQualite>
  ): Promise<DomaineQualite> {
    const { data, error } = await this.supabase
      .from("domaines")
      .update(domaine)
      .eq("iddomaine", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteDomaineQualite(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("domaines")
      .delete()
      .eq("iddomaine", id);

    if (error) throw error;
  }

  // ===== CATEGORIES =====
  async loadCategories(): Promise<CategoriesujetExtended[]> {
    const { data, error } = await this.supabase
      .from("categoriessujets")
      .select("*")
      .order("nomcategorie", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Charger les catégories avec leurs domaines d'usage
  async loadCategoriesWithDomaines(): Promise<CategoriesujetExtended[]> {
    // 1. Charger toutes les catégories
    const categories = await this.loadCategories();

    // 2. Pour chaque catégorie, trouver les domaines qui l'utilisent
    const categoriesWithDomaines = await Promise.all(
      categories.map(async (categorie) => {
        try {
          // ✅ Requête simplifiée : on va chercher directement les domaines distincts
          const { data: domainesData, error: domainesError } =
            await this.supabase
              .from("sujets")
              .select(
                `
              domaines!inner(iddomaine, nomdomaine)
            `
              )
              .eq("idcategoriesujet", categorie.idcategoriesujet);

          if (domainesError) throw domainesError;

          // ✅ Extraction simple des domaines avec déduplication
          const domainesSet = new Map();
          (domainesData || []).forEach((item: any) => {
            if (item.domaines) {
              domainesSet.set(item.domaines.iddomaine, {
                iddomaine: item.domaines.iddomaine,
                nomdomaine: item.domaines.nomdomaine,
                description: undefined,
              });
            }
          });

          const domainesUniques = Array.from(domainesSet.values());

          return {
            ...categorie,
            domaines: domainesUniques,
            nombreDomaines: domainesUniques.length,
          } as CategoriesujetExtended;
        } catch (error) {
          console.error(
            "Erreur pour catégorie",
            categorie.idcategoriesujet,
            error
          );
          return {
            ...categorie,
            domaines: [],
            nombreDomaines: 0,
          } as CategoriesujetExtended;
        }
      })
    );

    return categoriesWithDomaines;
  }

  async createCategorie(
    categorie: Partial<CategoriesujetExtended>
  ): Promise<CategoriesujetExtended> {
    const { data, error } = await this.supabase
      .from("categoriessujets")
      .insert([categorie])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCategorie(
    id: number,
    categorie: Partial<CategoriesujetExtended>
  ): Promise<CategoriesujetExtended> {
    const { data, error } = await this.supabase
      .from("categoriessujets")
      .update(categorie)
      .eq("idcategoriesujet", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCategorie(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("categoriessujets")
      .delete()
      .eq("idcategoriesujet", id);

    if (error) throw error;
  }

  // ===== SUJETS =====
  async loadSujetsForDomaineQualite(domaineId: number): Promise<Sujet[]> {
    const { data, error } = await this.supabase
      .from("sujets")
      .select("*")
      .eq("iddomaine", domaineId)
      .order("nomsujet");

    if (error) throw error;
    return data || [];
  }

  async loadAllSujets(): Promise<Sujet[]> {
    const { data, error } = await this.supabase
      .from("sujets")
      .select("*")
      .order("nomsujet");

    if (error) throw error;
    return data || [];
  }

  async createSujet(sujet: Partial<Sujet>): Promise<Sujet> {
    const { data, error } = await this.supabase
      .from("sujets")
      .insert([sujet])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSujet(id: number, sujet: Partial<Sujet>): Promise<Sujet> {
    const { data, error } = await this.supabase
      .from("sujets")
      .update(sujet)
      .eq("idsujet", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Method to check dependencies before deletion
  // Méthode pour vérifier les dépendances d'un sujet
  async checkSujetDependencies(
    id: number
  ): Promise<{ count: number; details: any[] }> {
    const { data, error } = await this.supabase
      .from("activitesconseillers_sujets")
      .select("*")
      .eq("idsujet", id);

    if (error) throw error;

    return {
      count: data?.length || 0,
      details: data || [],
    };
  }

  // Méthode pour vérifier les dépendances de plusieurs sujets
  async checkMultipleSujetsDependencies(
    sujetIds: number[]
  ): Promise<{ [key: number]: number }> {
    const dependencies: { [key: number]: number } = {};

    for (const id of sujetIds) {
      const result = await this.checkSujetDependencies(id);
      dependencies[id] = result.count;
    }

    return dependencies;
  }

  // Enhanced delete method with dependency information
  async deleteSujet(id: number): Promise<void> {
    // Check what will be deleted
    const dependencies = await this.checkSujetDependencies(id);

    if (dependencies.count > 0) {
      console.log(
        `⚠️ Suppression du sujet ${id}: ${dependencies.count} activités de conseillers seront également supprimées`
      );
    }

    // First, delete all dependent records from activitesconseillers_sujets
    const { error: dependentError } = await this.supabase
      .from("activitesconseillers_sujets")
      .delete()
      .eq("idsujet", id);

    if (dependentError) {
      console.error(
        "Erreur lors de la suppression des dépendances:",
        dependentError
      );
      throw dependentError;
    }

    // Then delete the subject itself
    const { error } = await this.supabase
      .from("sujets")
      .delete()
      .eq("idsujet", id);

    if (error) {
      console.error("Erreur lors de la suppression du sujet:", error);
      throw error;
    }

    if (dependencies.count > 0) {
      console.log(
        `✅ Sujet ${id} et ${dependencies.count} dépendances supprimés avec succès`
      );
    }
  }

  // ===== PRATIQUES =====
  async loadPratiques(): Promise<Pratique[]> {
    const { data, error } = await this.supabase
      .from("pratiques")
      .select("*")
      .order("nompratique");

    if (error) throw error;
    return data || [];
  }

  async loadCategoriesPratiques(): Promise<CategoriePratique[]> {
    const { data, error } = await this.supabase
      .from("categoriespratiques")
      .select("*")
      .order("nomcategorie");

    if (error) throw error;
    return data || [];
  }

  // ===== SUJETS-PRATIQUES (TRADUCTEUR) =====
  async loadSujetsPratiques(idsujet: number): Promise<SujetPratique[]> {
    const { data, error } = await this.supabase
      .from("sujetspratiques")
      .select("*")
      .eq("idsujet", idsujet)
      .order("importance", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async loadAllSujetsPratiques(): Promise<SujetPratique[]> {
    const { data, error } = await this.supabase
      .from("sujetspratiques")
      .select("*");

    if (error) throw error;
    return data || [];
  }

  async addSujetPratique(
    sujetPratique: Omit<SujetPratique, "id">
  ): Promise<SujetPratique> {
    const { data, error } = await this.supabase
      .from("sujetspratiques")
      .insert([sujetPratique])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSujetPratiqueImportance(
    idsujet: number,
    idpratique: number,
    importance: number
  ): Promise<void> {
    const { error } = await this.supabase
      .from("sujetspratiques")
      .update({ importance })
      .eq("idsujet", idsujet)
      .eq("idpratique", idpratique);

    if (error) throw error;
  }

  async deleteSujetPratique(
    idsujet: number,
    idpratique: number
  ): Promise<void> {
    const { error } = await this.supabase
      .from("sujetspratiques")
      .delete()
      .eq("idsujet", idsujet)
      .eq("idpratique", idpratique);

    if (error) throw error;
  }

  async saveSujetsPratiques(sujetsPratiques: SujetPratique[]): Promise<void> {
    // ✅ Correction: onConflict doit être une string, pas un array
    const { error } = await this.supabase.from("sujetspratiques").upsert(
      sujetsPratiques.map((sp) => ({
        idsujet: sp.idsujet,
        idpratique: sp.idpratique,
        importance: sp.importance,
      })),
      { onConflict: "idsujet,idpratique" } // ✅ String au lieu d'array
    );

    if (error) throw error;
  }

  // Charger les pratiques liées à un sujet avec leurs détails
  async loadPratiquesForSujet(
    idsujet: number
  ): Promise<(Pratique & { importance: number })[]> {
    const { data, error } = await this.supabase
      .from("sujetspratiques")
      .select(
        `
        importance,
        pratiques!inner(*)
      `
      )
      .eq("idsujet", idsujet)
      .order("importance", { ascending: false });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      ...item.pratiques,
      importance: item.importance,
    }));
  }

  // ===== PONDERATIONS =====
  async loadPonderationsForSujets(
    sujetIds: number[]
  ): Promise<PonderationSujet[]> {
    if (sujetIds.length === 0) return [];

    const { data, error } = await this.supabase
      .from("ponderation_sujets")
      .select("*")
      .in("idsujet", sujetIds);

    if (error) throw error;
    return data || [];
  }

  async savePonderations(ponderations: PonderationSujet[]): Promise<void> {
    // ✅ Correction: onConflict doit être une string, pas un array
    const { error } = await this.supabase.from("ponderation_sujets").upsert(
      ponderations.map((p) => ({
        idsujet: p.idsujet,
        conforme: p.conforme,
        partiellement_conforme: p.partiellement_conforme,
        non_conforme: p.non_conforme,
        permet_partiellement_conforme: p.permet_partiellement_conforme,
      })),
      { onConflict: "idsujet" } // ✅ String au lieu d'array
    );

    if (error) throw error;
  }

  // ===== LIAISONS ENTREPRISE-DOMAINE QUALITÉ =====
  async loadEntreprisesForDomaineQualite(
    domaineId: number
  ): Promise<Entreprise[]> {
    const { data: liaisons, error: liaisonsError } = await this.supabase
      .from("entreprise_domaines")
      .select("identreprise")
      .eq("iddomaine", domaineId);

    if (liaisonsError) throw liaisonsError;

    if ((liaisons || []).length === 0) return [];

    const entrepriseIds = (liaisons || []).map((l) => l.identreprise);

    const { data: entreprises, error: entreprisesError } = await this.supabase
      .from("entreprises")
      .select("*")
      .in("identreprise", entrepriseIds)
      .order("nomentreprise");

    if (entreprisesError) throw entreprisesError;
    return entreprises || [];
  }

  async linkEntrepriseToDomaine(
    entrepriseId: number,
    domaineId: number
  ): Promise<void> {
    const { error } = await this.supabase
      .from("entreprise_domaines")
      .insert([{ identreprise: entrepriseId, iddomaine: domaineId }]);

    if (error) throw error;
  }

  async unlinkEntrepriseFromDomaine(
    entrepriseId: number,
    domaineId: number
  ): Promise<void> {
    const { error } = await this.supabase
      .from("entreprise_domaines")
      .delete()
      .eq("identreprise", entrepriseId)
      .eq("iddomaine", domaineId);

    if (error) throw error;
  }
}
