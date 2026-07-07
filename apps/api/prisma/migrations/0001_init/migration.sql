-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "organization_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "organization_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "organization_users_organization_id_user_id_key" ON "organization_users"("organization_id", "user_id");

CREATE TABLE "roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "roles_organization_id_key_key" ON "roles"("organization_id", "key");

CREATE TABLE "permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

CREATE TABLE "role_permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "source_type" TEXT,
    "detected_framework" TEXT,
    "detected_runtime" TEXT,
    "detected_language" TEXT,
    "status" TEXT NOT NULL DEFAULT 'created',
    "repo_url" TEXT,
    "root_path" TEXT,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "projects_organization_id_slug_key" ON "projects"("organization_id", "slug");

CREATE TABLE "project_environments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "branch_name" TEXT,
    "deployment_provider" TEXT,
    "deployment_config" JSONB,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "project_environments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "project_sources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "kind" TEXT NOT NULL,
    "source_ref" TEXT NOT NULL,
    "credentials_ref" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_sources_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "imports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "source_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "error_log" TEXT,
    "summary" JSONB,
    CONSTRAINT "imports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "project_files" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "path" TEXT NOT NULL,
    "extension" TEXT,
    "mime_type" TEXT,
    "size_bytes" INTEGER,
    "checksum" TEXT,
    "category" TEXT NOT NULL DEFAULT 'unknown',
    "is_binary" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "project_files_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "project_files_project_id_path_key" ON "project_files"("project_id", "path");

CREATE TABLE "file_dependencies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "source_file_id" UUID NOT NULL,
    "target_file_id" UUID NOT NULL,
    "dependency_type" TEXT NOT NULL,
    CONSTRAINT "file_dependencies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "analysis_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "import_id" UUID,
    "adapter_key" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "results" JSONB,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    CONSTRAINT "analysis_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "detected_technologies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "evidence" JSONB,
    CONSTRAINT "detected_technologies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "routes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "path" TEXT NOT NULL,
    "route_name" TEXT,
    "method" TEXT NOT NULL DEFAULT 'GET',
    "source_file_id" UUID,
    "layout_id" UUID,
    "page_id" UUID,
    "metadata" JSONB,
    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "routes_project_id_path_method_key" ON "routes"("project_id", "path", "method");

CREATE TABLE "pages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "page_type" TEXT NOT NULL DEFAULT 'static',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "seo_title" TEXT,
    "seo_desc" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pages_project_id_slug_key" ON "pages"("project_id", "slug");

CREATE TABLE "layouts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "source_file_id" UUID,
    "parent_layout_id" UUID,
    "metadata" JSONB,
    CONSTRAINT "layouts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "components" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "component_key" TEXT NOT NULL,
    "source_file_id" UUID,
    "component_type" TEXT NOT NULL DEFAULT 'ui',
    "props_schema" JSONB,
    "metadata" JSONB,
    CONSTRAINT "components_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "components_project_id_component_key_key" ON "components"("project_id", "component_key");

CREATE TABLE "page_nodes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "page_id" UUID,
    "layout_id" UUID,
    "parent_node_id" UUID,
    "component_id" UUID,
    "node_type" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "props" JSONB,
    "bindings" JSONB,
    "styles" JSONB,
    "source_map" JSONB,
    CONSTRAINT "page_nodes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "design_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "token_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "metadata" JSONB,
    CONSTRAINT "design_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "design_tokens_project_id_token_type_name_key" ON "design_tokens"("project_id", "token_type", "name");

CREATE TABLE "style_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "node_id" UUID,
    "component_id" UUID,
    "selector" TEXT,
    "declarations" JSONB NOT NULL,
    "breakpoint" TEXT,
    "pseudo_state" TEXT,
    "source_file_id" UUID,
    CONSTRAINT "style_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "content_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "schema" JSONB NOT NULL,
    CONSTRAINT "content_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "content_types_project_id_slug_key" ON "content_types"("project_id", "slug");

CREATE TABLE "content_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content_type_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "content_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "media_assets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "size_bytes" INTEGER NOT NULL,
    "alt_text" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "menus" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "location_key" TEXT NOT NULL,
    "metadata" JSONB,
    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "menu_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "menu_id" UUID NOT NULL,
    "parent_item_id" UUID,
    "label" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_ref" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "settings" JSONB,
    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "forms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "schema" JSONB NOT NULL,
    "settings" JSONB,
    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "form_submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "form_id" UUID NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "change_sets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "created_by_id" UUID NOT NULL,
    "source" TEXT NOT NULL,
    "summary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "change_sets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "file_patches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "change_set_id" UUID NOT NULL,
    "project_file_id" UUID NOT NULL,
    "patch_type" TEXT NOT NULL,
    "patch_payload" JSONB NOT NULL,
    "before_checksum" TEXT NOT NULL,
    "after_checksum" TEXT,
    "applied_at" TIMESTAMP(3),
    CONSTRAINT "file_patches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "change_set_id" UUID,
    "storage_key" TEXT NOT NULL,
    "manifest" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "snapshots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "deployments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "environment_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "provider" TEXT,
    "logs" TEXT,
    "preview_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    CONSTRAINT "deployments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "project_id" UUID,
    "actor_user_id" UUID,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKeys
ALTER TABLE "organization_users" ADD CONSTRAINT "organization_users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;
ALTER TABLE "organization_users" ADD CONSTRAINT "organization_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "organization_users" ADD CONSTRAINT "organization_users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id");
ALTER TABLE "roles" ADD CONSTRAINT "roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id");
ALTER TABLE "project_environments" ADD CONSTRAINT "project_environments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "project_sources" ADD CONSTRAINT "project_sources_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "imports" ADD CONSTRAINT "imports_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "imports" ADD CONSTRAINT "imports_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "project_sources"("id");
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "file_dependencies" ADD CONSTRAINT "file_dependencies_source_file_id_fkey" FOREIGN KEY ("source_file_id") REFERENCES "project_files"("id") ON DELETE CASCADE;
ALTER TABLE "file_dependencies" ADD CONSTRAINT "file_dependencies_target_file_id_fkey" FOREIGN KEY ("target_file_id") REFERENCES "project_files"("id") ON DELETE CASCADE;
ALTER TABLE "analysis_runs" ADD CONSTRAINT "analysis_runs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "analysis_runs" ADD CONSTRAINT "analysis_runs_import_id_fkey" FOREIGN KEY ("import_id") REFERENCES "imports"("id");
ALTER TABLE "detected_technologies" ADD CONSTRAINT "detected_technologies_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "routes" ADD CONSTRAINT "routes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "routes" ADD CONSTRAINT "routes_source_file_id_fkey" FOREIGN KEY ("source_file_id") REFERENCES "project_files"("id");
ALTER TABLE "routes" ADD CONSTRAINT "routes_layout_id_fkey" FOREIGN KEY ("layout_id") REFERENCES "layouts"("id");
ALTER TABLE "routes" ADD CONSTRAINT "routes_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id");
ALTER TABLE "pages" ADD CONSTRAINT "pages_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "layouts" ADD CONSTRAINT "layouts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "layouts" ADD CONSTRAINT "layouts_source_file_id_fkey" FOREIGN KEY ("source_file_id") REFERENCES "project_files"("id");
ALTER TABLE "layouts" ADD CONSTRAINT "layouts_parent_layout_id_fkey" FOREIGN KEY ("parent_layout_id") REFERENCES "layouts"("id");
ALTER TABLE "components" ADD CONSTRAINT "components_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "components" ADD CONSTRAINT "components_source_file_id_fkey" FOREIGN KEY ("source_file_id") REFERENCES "project_files"("id");
ALTER TABLE "page_nodes" ADD CONSTRAINT "page_nodes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "page_nodes" ADD CONSTRAINT "page_nodes_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id");
ALTER TABLE "page_nodes" ADD CONSTRAINT "page_nodes_layout_id_fkey" FOREIGN KEY ("layout_id") REFERENCES "layouts"("id");
ALTER TABLE "page_nodes" ADD CONSTRAINT "page_nodes_parent_node_id_fkey" FOREIGN KEY ("parent_node_id") REFERENCES "page_nodes"("id");
ALTER TABLE "page_nodes" ADD CONSTRAINT "page_nodes_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "components"("id");
ALTER TABLE "design_tokens" ADD CONSTRAINT "design_tokens_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "style_rules" ADD CONSTRAINT "style_rules_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "style_rules" ADD CONSTRAINT "style_rules_source_file_id_fkey" FOREIGN KEY ("source_file_id") REFERENCES "project_files"("id");
ALTER TABLE "content_types" ADD CONSTRAINT "content_types_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "content_entries" ADD CONSTRAINT "content_entries_content_type_id_fkey" FOREIGN KEY ("content_type_id") REFERENCES "content_types"("id") ON DELETE CASCADE;
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "menus" ADD CONSTRAINT "menus_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE;
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parent_item_id_fkey" FOREIGN KEY ("parent_item_id") REFERENCES "menu_items"("id");
ALTER TABLE "forms" ADD CONSTRAINT "forms_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE;
ALTER TABLE "change_sets" ADD CONSTRAINT "change_sets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "change_sets" ADD CONSTRAINT "change_sets_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id");
ALTER TABLE "file_patches" ADD CONSTRAINT "file_patches_change_set_id_fkey" FOREIGN KEY ("change_set_id") REFERENCES "change_sets"("id") ON DELETE CASCADE;
ALTER TABLE "file_patches" ADD CONSTRAINT "file_patches_project_file_id_fkey" FOREIGN KEY ("project_file_id") REFERENCES "project_files"("id");
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_change_set_id_fkey" FOREIGN KEY ("change_set_id") REFERENCES "change_sets"("id");
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_environment_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "project_environments"("id") ON DELETE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id");
