GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."buscar_ou_criar_municipio"("p_nome" character varying, "p_uf" character varying, "p_codigo_ibge" character varying, "p_cep" character varying, "p_latitude" numeric, "p_longitude" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."buscar_ou_criar_municipio"("p_nome" character varying, "p_uf" character varying, "p_codigo_ibge" character varying, "p_cep" character varying, "p_latitude" numeric, "p_longitude" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."buscar_ou_criar_municipio"("p_nome" character varying, "p_uf" character varying, "p_codigo_ibge" character varying, "p_cep" character varying, "p_latitude" numeric, "p_longitude" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_multiple_users_data"("user_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_multiple_users_data"("user_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_multiple_users_data"("user_ids" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_data_json"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_data_json"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_data_json"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_info"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_info"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_info"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."convites" TO "anon";
GRANT ALL ON TABLE "public"."convites" TO "authenticated";
GRANT ALL ON TABLE "public"."convites" TO "service_role";



GRANT ALL ON TABLE "public"."departamentos" TO "anon";
GRANT ALL ON TABLE "public"."departamentos" TO "authenticated";
GRANT ALL ON TABLE "public"."departamentos" TO "service_role";



GRANT ALL ON TABLE "public"."estados" TO "anon";
GRANT ALL ON TABLE "public"."estados" TO "authenticated";
GRANT ALL ON TABLE "public"."estados" TO "service_role";



GRANT ALL ON SEQUENCE "public"."estados_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."estados_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."estados_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."etiquetas_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."etiquetas_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."etiquetas_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."etiquetas" TO "anon";
GRANT ALL ON TABLE "public"."etiquetas" TO "authenticated";
GRANT ALL ON TABLE "public"."etiquetas" TO "service_role";



GRANT ALL ON TABLE "public"."funcionalidades" TO "anon";
GRANT ALL ON TABLE "public"."funcionalidades" TO "authenticated";
GRANT ALL ON TABLE "public"."funcionalidades" TO "service_role";



GRANT ALL ON TABLE "public"."groups" TO "anon";
GRANT ALL ON TABLE "public"."groups" TO "authenticated";
GRANT ALL ON TABLE "public"."groups" TO "service_role";



GRANT ALL ON TABLE "public"."horarios_funcionamento" TO "anon";
GRANT ALL ON TABLE "public"."horarios_funcionamento" TO "authenticated";
GRANT ALL ON TABLE "public"."horarios_funcionamento" TO "service_role";



GRANT ALL ON TABLE "public"."municipios" TO "anon";
GRANT ALL ON TABLE "public"."municipios" TO "authenticated";
GRANT ALL ON TABLE "public"."municipios" TO "service_role";



GRANT ALL ON SEQUENCE "public"."municipios_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."municipios_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."municipios_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."organizacoes" TO "anon";
GRANT ALL ON TABLE "public"."organizacoes" TO "authenticated";
GRANT ALL ON TABLE "public"."organizacoes" TO "service_role";



GRANT ALL ON TABLE "public"."perfis" TO "anon";
GRANT ALL ON TABLE "public"."perfis" TO "authenticated";
GRANT ALL ON TABLE "public"."perfis" TO "service_role";



GRANT ALL ON TABLE "public"."permissoes" TO "anon";
GRANT ALL ON TABLE "public"."permissoes" TO "authenticated";
GRANT ALL ON TABLE "public"."permissoes" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."responsaveis_tecnicos" TO "anon";
GRANT ALL ON TABLE "public"."responsaveis_tecnicos" TO "authenticated";
GRANT ALL ON TABLE "public"."responsaveis_tecnicos" TO "service_role";



GRANT ALL ON TABLE "public"."usuarios_organizacoes" TO "anon";
GRANT ALL ON TABLE "public"."usuarios_organizacoes" TO "authenticated";
GRANT ALL ON TABLE "public"."usuarios_organizacoes" TO "service_role";



GRANT ALL ON TABLE "public"."usuarios_perfis" TO "anon";
GRANT ALL ON TABLE "public"."usuarios_perfis" TO "authenticated";
GRANT ALL ON TABLE "public"."usuarios_perfis" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;


