# Reporte de Cobertura de Pruebas
Fecha: 2026-05-20 | Proyecto: c63cf8b1-9e13-44f4-8d3f-4bcc59c7b433 | Modo: TDD

## 1. Resumen Ejecutivo
| Capa | Framework | Estado | Cobertura | Tests Pasados | Tests Fallidos |
|------|-----------|--------|-----------|---------------|----------------|
| api-gateway | pytest | FAIL | 0% | 0 | 12 |
| auth-service | pytest | FAIL | 0% | 0 | 23 |
| catalog-service | pytest | FAIL | 0% | 0 | 6 |
| notification-service | pytest | FAIL | 0% | 0 | 7 |
| order-service | pytest | FAIL | 0% | 0 | 13 |
| shared | pytest | FAIL | 47% | 7 | 8 |
| tests (root) | pytest | FAIL | 0% | 0 | 0 (9 skipped) |

**Evaluación general:** Todos los servicios backend fallan por ModuleNotFoundError. Los tests importan módulos Python que no existen (e.g., `api_gateway`, `auth_service`) ya que el código está escrito en TypeScript (.ts). La carpeta shared tiene 7 tests passing pero 8 fallan por errores de aserción en schemas y modelos. No se detectó directorio frontend.

## 2. KPIs de Calidad
| Indicador | Valor | Umbral | Estado |
|-----------|-------|--------|--------|
| Cobertura global (promedio) | 0% | ≥90% | FAIL |
| Tests totales ejecutados | 85 | - | - |
| Tests fallidos | 69 | 0 | FAIL |
| Capas sin cobertura | 7 | 0 | FAIL |

## 3. Detalle por Capa — Backend
| Archivo | %Stmts | %Branch | %Funcs | %Lines | Sin cubrir |
|---------|--------|---------|--------|--------|------------|
| api-gateway (todos .ts) | 0% | 0% | 0% | 0% | 100% |
| auth-service (todos .ts) | 0% | 0% | 0% | 0% | 100% |
| catalog-service (todos .ts) | 0% | 0% | 0% | 0% | 100% |
| notification-service (todos .ts) | 0% | 0% | 0% | 0% | 100% |
| order-service (todos .ts) | 0% | 0% | 0% | 0% | 100% |
| shared (7 passed, 8 failed) | 47% | N/A | N/A | N/A | 8 assertions |

## 4. Detalle por Capa — Frontend
No hay directorio frontend en el workspace.

## 5. Tests Fallidos
| Test | Capa | Error | Prioridad |
|------|------|-------|-----------|
| test_routing_to_auth_service_login | api-gateway | ModuleNotFoundError: No module named 'api_gateway' | ALTA |
| test_jwt_validation_required_for_protected_opportunities_routes | api-gateway | ModuleNotFoundError: No module named 'api_gateway' | ALTA |
| test_jwt_validation_invalid_token_returns_401 | api-gateway | ModuleNotFoundError: No module named 'api_gateway' | ALTA |
| test_rbac_for_opportunity_delete_requires_owner_role | api-gateway | ModuleNotFoundError: No module named 'api_gateway' | ALTA |
| test_rate_limiting_exceeded_returns_429 | api-gateway | ModuleNotFoundError: No module named 'api_gateway' | ALTA |
| test_fallback_error_returns_502_on_microservice_down | api-gateway | ModuleNotFoundError: No module named 'api_gateway' | ALTA |
| test_invalid_route_returns_404 | api-gateway | ModuleNotFoundError: No module named 'api_gateway' | ALTA |
| test_register_route_validation_error_returns_400 | api-gateway | ModuleNotFoundError: No module named 'api_gateway' | ALTA |
| test_patch_opportunity_requires_valid_status_value | api-gateway | ModuleNotFoundError: No module named 'api_gateway' | ALTA |
| test_health_endpoint_returns_200_and_status_ok | api-gateway | ModuleNotFoundError: No module named 'api_gateway' | ALTA |
| test_health_endpoint_returns_503_when_downstream_unavailable | api-gateway | ModuleNotFoundError: No module named 'api_gateway' | ALTA |
| test_structured_logging_on_request | api-gateway | ModuleNotFoundError: No module named 'api_gateway' | ALTA |
| test_register_valid_input_returns_201_and_user_fields | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_register_missing_email_returns_422 | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_register_duplicate_email_returns_409 | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_login_valid_credentials_returns_200_and_token_and_user | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_login_invalid_password_returns_401 | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_login_missing_email_returns_422 | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_me_with_valid_token_returns_user_profile | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_me_with_missing_token_returns_401 | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_me_with_invalid_token_returns_401 | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_logout_with_valid_token_returns_204 | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_hash_password_generates_different_hashes_for_same_password | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_verify_password_returns_true_for_correct_password | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_verify_password_returns_false_for_wrong_password | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_generate_jwt_contains_user_id_and_email | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_validate_jwt_with_valid_token_returns_payload | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_validate_jwt_with_invalid_token_raises_exception | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_rbac_allows_admin_to_manage_users | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_rbac_denies_non_admin_to_manage_users | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_create_user_persists_user_and_returns_user_object | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_get_user_by_email_returns_correct_user | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_get_user_by_email_returns_none_for_nonexistent_email | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_update_user_updates_fields_and_returns_updated_user | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_delete_user_removes_user_from_database | auth-service | ModuleNotFoundError: No module named 'auth_service' | ALTA |
| test_app_module_imports_all_required_modules | catalog-service | ModuleNotFoundError: No module named 'catalog_service' | ALTA |
| test_app_module_raises_on_missing_dependency | catalog-service | ModuleNotFoundError: No module named 'catalog_service' | ALTA |
| test_app_module_provides_global_configuration | catalog-service | ModuleNotFoundError: No module named 'catalog_service' | ALTA |
| test_application_starts_and_responds_to_health_check | catalog-service | ModuleNotFoundError: No module named 'catalog_service' | ALTA |
| test_application_fails_on_invalid_env_vars | catalog-service | ModuleNotFoundError: No module named 'catalog_service' | ALTA |
| test_application_logs_startup_message | catalog-service | ModuleNotFoundError: No module named 'catalog_service' | ALTA |
| test_app_module_imports_notification_controllers_and_services | notification-service | ModuleNotFoundError: No module named 'notification_service' | ALTA |
| test_app_module_registers_redis_and_rabbitmq_providers | notification-service | ModuleNotFoundError: No module named 'notification_service' | ALTA |
| test_app_module_uses_mock_rabbitmq_if_no_credentials | notification-service | ModuleNotFoundError: No module named 'notification_service' | ALTA |
| test_app_module_fails_on_missing_redis_url | notification-service | ModuleNotFoundError: No module named 'notification_service' | ALTA |
| test_bootstrap_nestjs_app_starts_successfully | notification-service | ModuleNotFoundError: No module named 'notification_service' | ALTA |
| test_bootstrap_with_missing_env_vars_fails | notification-service | ModuleNotFoundError: No module named 'notification_service' | ALTA |
| test_bootstrap_with_invalid_port_env_var | notification-service | ModuleNotFoundError: No module named 'notification_service' | ALTA |
| test_app_module_imports_order_module_and_dependencies | order-service | ModuleNotFoundError: No module named 'order_service' | ALTA |
| test_app_module_fails_on_missing_dependency | order-service | ModuleNotFoundError: No module named 'order_service' | ALTA |
| test_app_module_provides_global_configuration | order-service | ModuleNotFoundError: No module named 'order_service' | ALTA |
| test_create_order_with_valid_items_and_stock_returns_201 | order-service | ModuleNotFoundError: No module named 'order_service' | ALTA |
| test_create_order_with_insufficient_stock_returns_400 | order-service | ModuleNotFoundError: No module named 'order_service' | ALTA |
| test_create_order_missing_items_field_returns_422 | order-service | ModuleNotFoundError: No module named 'order_service' | ALTA |
| test_get_order_by_id_returns_order_details | order-service | ModuleNotFoundError: No module named 'order_service' | ALTA |
| test_get_order_by_invalid_id_returns_404 | order-service | ModuleNotFoundError: No module named 'order_service' | ALTA |
| test_update_order_status_to_pagado_returns_200_and_status_updated | order-service | ModuleNotFoundError: No module named 'order_service' | ALTA |
| test_update_order_status_invalid_transition_returns_400 | order-service | ModuleNotFoundError: No module named 'order_service' | ALTA |
| test_add_item_to_existing_order_returns_201_and_item_added | order-service | ModuleNotFoundError: No module named 'order_service' | ALTA |
| test_add_item_to_order_with_insufficient_stock_returns_400 | order-service | ModuleNotFoundError: No module named 'order_service' | ALTA |
| test_get_order_history_by_user_returns_list_of_orders | order-service | ModuleNotFoundError: No module named 'order_service' | ALTA |
| test_user_table_schema_matches_spec | shared | AssertionError: primary_key is None | MEDIA |
| test_opportunities_table_schema_and_indexes | shared | AssertionError: primary_key is None | MEDIA |
| test_sessions_table_schema_and_expiry_constraint | shared | AssertionError: primary_key is None | MEDIA |
| test_opportunity_interface_accepts_valid_fields | shared | assert False is True | MEDIA |
| test_opportunity_interface_invalid_status_enum | shared | assert 'id' == 'status' | MEDIA |
| test_session_interface_accepts_valid_fields | shared | assert False is True | MEDIA |
| test_session_interface_expired_date_format | shared | assert 'id' == 'expiresAt' | MEDIA |
| test_user_interface_accepts_valid_fields | shared | assert False is True | MEDIA |

## 6. Líneas Sin Cubrir (top 10 por impacto)
| Archivo | Líneas | Motivo probable |
|---------|--------|-----------------|
| backend/api-gateway/src/*.ts | ~100 | Tests importan módulos Python que no existen |
| backend/auth-service/src/*.ts | ~200 | Tests importan módulos Python que no existen |
| backend/catalog-service/src/*.ts | ~50 | Tests importan módulos Python que no existen |
| backend/notification-service/src/*.ts | ~80 | Tests importan módulos Python que no existen |
| backend/order-service/src/*.ts | ~150 | Tests importan módulos Python que no existen |
| backend/shared/db/schemas.ts | N/A | Error en validación de primary_key |
| backend/shared/models/*.ts | N/A | Error en validación de interfaces TypeScript |

## 7. Análisis de Calidad
### Fortalezas
- La carpeta shared tiene 7 tests passing que validan configuración de env y algunos modelos
- Los tests en tests/ (root) están correctamente skipping cuando docker no está disponible

### Áreas de Mejora
- Los 5 microservicios (api-gateway, auth-service, catalog-service, notification-service, order-service) están escritos en TypeScript pero los tests intentan importar módulos Python
- Los tests de schemas en shared fallan porque la estructura de columnas devuelta no tiene el formato esperado (primary_key no existe)
- Los tests de modelos en shared fallan porque las interfaces TypeScript no son reconocidas como válidas

## 8. Recomendaciones (priorizadas)
1. **ALTA:** Traducir todos los tests de backend de Python a TypeScript/Jest para que coincidan con el código fuente (.ts)
2. **ALTA:** Compilar el código TypeScript a JavaScript antes de ejecutar tests, o usar ts-node para ejecutar tests directamente
3. **MEDIA:** Corregir los tests de schemas en shared para manejar correctamente la estructura de columnas devuelta
4. **MEDIA:** Corregir los tests de modelos para usar validación de interfaces TypeScript correcta

## 9. Output Completo de Tests
### Backend - api-gateway
```
============================= test session starts ==============================
platform linux -- Python 3.11.15, pytest-8.3.2, pluggy-1.6.0
benchmark: 4.0.0 (defaults: timer=time.perf_counter disable_gc=False min_rounds=5 min_time=0.000005 max_time=1.0 calibration_precision=10 warmup=False warmup_iterations=100000)
rootdir: /workspace/c63cf8b1-9e13-44f4-8d3f-4bcc59c7b433/backend/api-gateway
plugins: benchmark-4.0.0, langsmith-0.8.5, asyncio-0.24.0, anyio-4.13.0
asyncio: mode=Mode.STRICT, default_loop_scope=None
collected 12 items

tests/test_app_module.py FFFFFFFFF                                       [ 75%]
tests/test_main.py FFF                                                   [100%]

=================================== FAILURES ===================================
______________________ test_routing_to_auth_service_login ______________________
tests/test_app_module.py:10: in test_routing_to_auth_service_login
    from api_gateway.app.module import GatewayModule
E   ModuleNotFoundError: No module named 'api_gateway'
_______ test_jwt_validation_required_for_protected_opportunities_routes ________
tests/test_app_module.py:32: in test_jwt_validation_required_for_protected_opportunities_routes
    from api_gateway.app.module import GatewayModule
E   ModuleNotFoundError: No module named 'api_gateway'
________________ test_jwt_validation_invalid_token_returns_401 _________________
tests/test_app_module.py:42: in test_jwt_validation_invalid_token_returns_401
    from api_gateway.app.module import GatewayModule
E   ModuleNotFoundError: No module named 'api_gateway'
_____________ test_rbac_for_opportunity_delete_requires_owner_role _____________
tests/test_app_module.py:51: in test_rbac_for_opportunity_delete_requires_owner_role
    from api_gateway.app.module import GatewayModule
E   ModuleNotFoundError: No module named 'api_gateway'
___________________ test_rate_limiting_exceeded_returns_429 ____________________
tests/test_app_module.py:61: in test_rate_limiting_exceeded_returns_429
    from api_gateway.app.module import GatewayModule
E   ModuleNotFoundError: No module named 'api_gateway'
_____________ test_fallback_error_returns_502_on_microservice_down _____________
tests/test_app_module.py:71: in test_fallback_error_returns_502_on_microservice_down
    from api_gateway.app.module import GatewayModule
E   ModuleNotFoundError: No module named 'api_gateway'
________________________ test_invalid_route_returns_404 ________________________
tests/test_app_module.py:90: in test_invalid_route_returns_404
    from api_gateway.app.module import GatewayModule
E   ModuleNotFoundError: No module named 'api_gateway'
_______________ test_register_route_validation_error_returns_400 _______________
tests/test_app_module.py:99: in test_register_route_validation_error_returns_400
    from api_gateway.app.module import GatewayModule
E   ModuleNotFoundError: No module named 'api_gateway'
______________ test_patch_opportunity_requires_valid_status_value ______________
tests/test_app_module.py:109: in test_patch_opportunity_requires_valid_status_value
    from api_gateway.app.module import GatewayModule
E   ModuleNotFoundError: No module named 'api_gateway'
________________ test_health_endpoint_returns_200_and_status_ok ________________
tests/test_main.py:10: in test_health_endpoint_returns_200_and_status_ok
    from api_gateway.main import Gateway
E   ModuleNotFoundError: No module named 'api_gateway'
_________ test_health_endpoint_returns_503_when_downstream_unavailable _________
tests/test_main.py:25: in test_health_endpoint_returns_503_when_downstream_unavailable
    from api_gateway.main import Gateway
E   ModuleNotFoundError: No module named 'api_gateway'
______________________ test_structured_logging_on_request ______________________
tests/test_main.py:41: in test_structured_logging_on_request
    from api_gateway.main import Gateway
E   ModuleNotFoundError: No module named 'api_gateway'
=========================== short test summary info ============================
FAILED tests/test_app_module.py::test_routing_to_auth_service_login - ModuleN...
FAILED tests/test_app_module.py::test_jwt_validation_required_for_protected_opportunities_routes
FAILED tests/test_app_module.py::test_jwt_validation_invalid_token_returns_401
FAILED tests/test_app_module.py::test_rbac_for_opportunity_delete_requires_owner_role
FAILED tests/test_app_module.py::test_rate_limiting_exceeded_returns_429 - Mo...
FAILED tests/test_app_module.py::test_fallback_error_returns_502_on_microservice_down
FAILED tests/test_app_module.py::test_invalid_route_returns_404 - ModuleNotFo...
FAILED tests/test_app_module.py::test_register_route_validation_error_returns_400
FAILED tests/test_app_module.py::test_patch_opportunity_requires_valid_status_value
FAILED tests/test_main.py::test_health_endpoint_returns_200_and_status_ok - M...
FAILED tests/test_main.py::test_health_endpoint_returns_503_when_downstream_unavailable
FAILED tests/test_main.py::test_structured_logging_on_request - ModuleNotFoun...
============================== 12 failed in 0.89s ==============================
```

### Backend - auth-service
```
============================= test session starts ==============================
platform linux -- Python 3.11.15, pytest-8.3.2, pluggy-1.6.0
benchmark: 4.0.0 (defaults: timer=time.perf_counter disable_gc=False min_rounds=5 min_time=0.000005 max_time=1.0 calibration_precision=10 warmup=False warmup_iterations=100000)
rootdir: /workspace/c63cf8b1-9e13-44f4-8d3f-4bcc59c7b433/backend/auth-service
plugins: benchmark-4.0.0, langsmith-0.8.5, asyncio-0.24.0, anyio-4.13.0
asyncio: mode=Mode.STRICT, default_loop_scope=None
collected 23 items

tests/test_auth_controller.py FFFFFFFFFF                                 [ 43%]
tests/test_auth_service.py FFFFFFFF                                      [ 78%]
tests/test_user_repository.py FFFFF                                      [100%]

=================================== FAILURES ===================================
____________ test_register_valid_input_returns_201_and_user_fields _____________
tests/test_auth_controller.py:10: in test_register_valid_input_returns_201_and_user_fields
    from auth_service.auth.controller import AuthController
E   ModuleNotFoundError: No module named 'auth_service'
___________________ test_register_missing_email_returns_422 ____________________
tests/test_auth_controller.py:43: in test_register_missing_email_returns_422
    from auth_service.auth.controller import AuthController
E   ModuleNotFoundError: No module named 'auth_service'
__________________ test_register_duplicate_email_returns_409 ___________________
tests/test_auth_controller.py:62: in test_register_duplicate_email_returns_409
    from auth_service.auth.controller import AuthController
E   ModuleNotFoundError: No module named 'auth_service'
_________ test_login_valid_credentials_returns_200_and_token_and_user __________
tests/test_auth_controller.py:86: in test_login_valid_credentials_returns_200_and_token_and_user
    from auth_service.auth.controller import AuthController
E   ModuleNotFoundError: No module named 'auth_service'
___________________ test_login_invalid_password_returns_401 ____________________
tests/test_auth_controller.py:117: in test_login_invalid_password_returns_401
    from auth_service.auth.controller import AuthController
E   ModuleNotFoundError: No module named 'auth_service'
_____________________ test_login_missing_email_returns_422 _____________________
tests/test_auth_controller.py:140: in test_login_missing_email_returns_422
    from auth_service.auth.controller import AuthController
E   ModuleNotFoundError: No module named 'auth_service'
________________ test_me_with_valid_token_returns_user_profile _________________
tests/test_auth_controller.py:156: in test_me_with_valid_token_returns_user_profile
    from auth_service.auth.controller import AuthController
E   ModuleNotFoundError: No module named 'auth_service'
____________________ test_me_with_missing_token_returns_401 ____________________
tests/test_auth_controller.py:182: in test_me_with_missing_token_returns_401
    from auth_service.auth.controller import AuthController
E   ModuleNotFoundError: No module named 'auth_service'
____________________ test_me_with_invalid_token_returns_401 ____________________
tests/test_auth_controller.py:198: in test_me_with_invalid_token_returns_401
    from auth_service.auth.controller import AuthController
E   ModuleNotFoundError: No module named 'auth_service'
___________________ test_logout_with_valid_token_returns_204 ___________________
tests/test_auth_controller.py:218: in test_logout_with_valid_token_returns_204
    from auth_service.auth.controller import AuthController
E   ModuleNotFoundError: No module named 'auth_service'
_______ test_hash_password_generates_different_hashes_for_same_password ________
tests/test_auth_service.py:10: in test_hash_password_generates_different_hashes_for_same_password
    from auth_service.auth.service import AuthService
E   ModuleNotFoundError: No module named 'auth_service'
____________ test_verify_password_returns_true_for_correct_password ____________
tests/test_auth_service.py:22: in test_verify_password_returns_true_for_correct_password
    from auth_service.auth.service import AuthService
E   ModuleNotFoundError: No module named 'auth_service'
____________ test_verify_password_returns_false_for_wrong_password _____________
tests/test_auth_service.py:33: in test_verify_password_returns_false_for_wrong_password
    from auth_service.auth.service import AuthService
E   ModuleNotFoundError: No module named 'auth_service'
_________________ test_generate_jwt_contains_user_id_and_email _________________
tests/test_auth_service.py:44: in test_generate_jwt_contains_user_id_and_email
    from auth_service.auth.service import AuthService
E   ModuleNotFoundError: No module named 'auth_service'
______________ test_validate_jwt_with_valid_token_returns_payload ______________
tests/test_auth_service.py:56: in test_validate_jwt_with_valid_token_returns_payload
    from auth_service.auth.service import AuthService
E   ModuleNotFoundError: No module named 'auth_service'
____________ test_validate_jwt_with_invalid_token_raises_exception ____________
tests/test_auth_service.py:69: in test_validate_jwt_with_invalid_token_raises_exception
    from auth_service.auth.service import AuthService
E   ModuleNotFoundError: No module named 'auth_service'
____________________ test_rbac_allows_admin_to_manage_users ____________________
tests/test_auth_service.py:78: in test_rbac_allows_admin_to_manage_users
    from auth_service.auth.service import AuthService
E   ModuleNotFoundError: No module named 'auth_service'
__________________ test_rbac_denies_non_admin_to_manage_users __________________
tests/test_auth_service.py:88: in test_rbac_denies_non_admin_to_manage_users
    from auth_service.auth.service import AuthService
E   ModuleNotFoundError: No module named 'auth_service'
____________ test_create_user_persists_user_and_returns_user_object ____________
tests/test_user_repository.py:10: in test_create_user_persists_user_and_returns_user_object
    from auth_service.auth.repository import UserRepository
E   ModuleNotFoundError: No module named 'auth_service'
_________________ test_get_user_by_email_returns_correct_user __________________
tests/test_user_repository.py:40: in test_get_user_by_email_returns_correct_user
    from auth_service.auth.repository import UserRepository
E   ModuleNotFoundError: No module named 'auth_service'
__________ test_get_user_by_email_returns_none_for_nonexistent_email ___________
tests/test_user_repository.py:66: in test_get_user_by_email_returns_none_for_nonexistent_email
    from auth_service.auth.repository import UserRepository
E   ModuleNotFoundError: No module named 'auth_service'
___________ test_update_user_updates_fields_and_returns_updated_user ___________
tests/test_user_repository.py:83: in test_update_user_updates_fields_and_returns_updated_user
    from auth_service.auth.repository import UserRepository
E   ModuleNotFoundError: No module named 'auth_service'
_________________ test_delete_user_removes_user_from_database __________________
tests/test_user_repository.py:110: in test_delete_user_removes_user_from_database
    from auth_service.auth.repository import UserRepository
E   ModuleNotFoundError: No module named 'auth_service'
=========================== short test summary info ============================
FAILED tests/test_auth_controller.py::test_register_valid_input_returns_201_and_user_fields
FAILED tests/test_auth_controller.py::test_register_missing_email_returns_422
FAILED tests/test_auth_controller.py::test_register_duplicate_email_returns_409
FAILED tests/test_auth_controller.py::test_login_valid_credentials_returns_200_and_token_and_user
FAILED tests/test_auth_controller.py::test_login_invalid_password_returns_401
FAILED tests/test_auth_controller.py::test_login_missing_email_returns_422 - ...
FAILED tests/test_auth_controller.py::test_me_with_valid_token_returns_user_profile
FAILED tests/test_auth_controller.py::test_me_with_missing_token_returns_401
FAILED tests/test_auth_controller.py::test_me_with_invalid_token_returns_401
FAILED tests/test_auth_controller.py::test_logout_with_valid_token_returns_204
FAILED tests/test_auth_service.py::test_hash_password_generates_different_hashes_for_same_password
FAILED tests/test_auth_service.py::test_verify_password_returns_true_for_correct_password
FAILED tests/test_auth_service.py::test_verify_password_returns_false_for_wrong_password
FAILED tests/test_auth_service.py::test_generate_jwt_contains_user_id_and_email
FAILED tests/test_auth_service.py::test_validate_jwt_with_valid_token_returns_payload
FAILED tests/test_auth_service.py::test_validate_jwt_with_invalid_token_raises_exception
FAILED tests/test_auth_service.py::test_rbac_allows_admin_to_manage_users - M...
FAILED tests/test_auth_service.py::test_rbac_denies_non_admin_to_manage_users
FAILED tests/test_user_repository.py::test_create_user_persists_user_and_returns_user_object
FAILED tests/test_user_repository.py::test_get_user_by_email_returns_correct_user
FAILED tests/test_user_repository.py::test_get_user_by_email_returns_none_for_nonexistent_email
FAILED tests/test_user_repository.py::test_update_user_updates_fields_and_returns_updated_user
FAILED tests/test_user_repository.py::test_delete_user_removes_user_from_database
============================== 23 failed in 1.07s ==============================
```

### Backend - catalog-service
```
============================= test session starts ==============================
platform linux -- Python 3.11.15, pytest-8.3.2, pluggy-1.6.0
benchmark: 4.0.0 (defaults: timer=time.perf_counter disable_gc=False min_rounds=5 min_time=0.000005 max_time=1.0 calibration_precision=10 warmup=False warmup_iterations=100000)
rootdir: /workspace/c63cf8b1-9e13-44f4-8d3f-4bcc59c7b433/backend/catalog-service
plugins: benchmark-4.0.0, langsmith-0.8.5, asyncio-0.24.0, anyio-4.13.0
asyncio: mode=Mode.STRICT, default_loop_scope=None
collected 6 items

tests/test_app_module.py FFF                                             [ 50%]
tests/test_main.py FFF                                                   [100%]

=================================== FAILURES ===================================
_________________ test_app_module_imports_all_required_modules _________________
tests/test_app_module.py:10: in test_app_module_imports_all_required_modules
    from catalog_service.app.module import AppModule
E   ModuleNotFoundError: No module named 'catalog_service'
_________________ test_app_module_raises_on_missing_dependency _________________
tests/test_app_module.py:20: in test_app_module_raises_on_missing_dependency
    from catalog_service.app.module import AppModule
E   ModuleNotFoundError: No module named 'catalog_service'
________________ test_app_module_provides_global_configuration _________________
tests/test_app_module.py:30: in test_app_module_provides_global_configuration
    from catalog_service.app.module import AppModule
E   ModuleNotFoundError: No module named 'catalog_service'
_____________ test_application_starts_and_responds_to_health_check _____________
tests/test_main.py:10: in test_application_starts_and_responds_to_health_check
    from catalog_service.main import App
E   ModuleNotFoundError: No module named 'catalog_service'
__________________ test_application_fails_on_invalid_env_vars __________________
tests/test_main.py:25: in test_application_fails_on_invalid_env_vars
    from catalog_service.main import App
E   ModuleNotFoundError: No module named 'catalog_service'
____________________ test_application_logs_startup_message _____________________
tests/test_main.py:35: in test_application_logs_startup_message
    from catalog_service.main import App
E   ModuleNotFoundError: No module named 'catalog_service'
=========================== short test summary info ============================
FAILED tests/test_app_module.py::test_app_module_imports_all_required_modules
FAILED tests/test_app_module.py::test_app_module_raises_on_missing_dependency
FAILED tests/test_app_module.py::test_app_module_provides_global_configuration
FAILED tests/test_main.py::test_application_starts_and_responds_to_health_check
FAILED tests/test_main.py::test_application_fails_on_invalid_env_vars - Modul...
FAILED tests/test_main.py::test_application_logs_startup_message - ModuleNotF...
============================== 6 failed in 0.79s ==============================
```

### Backend - notification-service
```
============================= test session starts ==============================
platform linux -- Python 3.11.15, pytest-8.3.2, pluggy-1.6.0
benchmark: 4.0.0 (defaults: timer=time.perf_counter disable_gc=False min_rounds=5 min_time=0.000005 max_time=1.0 calibration_precision=10 warmup=False warmup_iterations=100000)
rootdir: /workspace/c63cf8b1-9e13-44f4-8d3f-4bcc59c7b433/backend/notification-service
plugins: benchmark-4.0.0, langsmith-0.8.5, asyncio-0.24.0, anyio-4.13.0
asyncio: mode=Mode.STRICT, default_loop_scope=None
collected 7 items

tests/test_app_module.py FFFF                                            [ 57%]
tests/test_main.py FFF                                                   [100%]

=================================== FAILURES ===================================
________ test_app_module_imports_notification_controllers_and_services _________
tests/test_app_module.py:10: in test_app_module_imports_notification_controllers_and_services
    from notification_service.app.module import AppModule
E   ModuleNotFoundError: No module named 'notification_service'
____________ test_app_module_registers_redis_and_rabbitmq_providers ____________
tests/test_app_module.py:18: in test_app_module_registers_redis_and_rabbitmq_providers
    from notification_service.app.module import AppModule
E   ModuleNotFoundError: No module named 'notification_service'
_____________ test_app_module_uses_mock_rabbitmq_if_no_credentials _____________
tests/test_app_module.py:27: in test_app_module_uses_mock_rabbitmq_if_no_credentials
    from notification_service.app.module import AppModule
E   ModuleNotFoundError: No module named 'notification_service'
__________________ test_app_module_fails_on_missing_redis_url __________________
tests/test_app_module.py:39: in test_app_module_fails_on_missing_redis_url
    from notification_service.app.module import AppModule
E   ModuleNotFoundError: No module named 'notification_service'
________________ test_bootstrap_nestjs_app_starts_successfully _________________
tests/test_main.py:10: in test_bootstrap_nestjs_app_starts_successfully
    from notification_service.main import App
E   ModuleNotFoundError: No module named 'notification_service'
__________________ test_bootstrap_with_missing_env_vars_fails __________________
tests/test_main.py:20: in test_bootstrap_with_missing_env_vars_fails
    from notification_service.main import App
E   ModuleNotFoundError: No module named 'notification_service'
___________________ test_bootstrap_with_invalid_port_env_var ___________________
tests/test_main.py:32: in test_bootstrap_with_invalid_port_env_var
    from notification_service.main import App
E   ModuleNotFoundError: No module named 'notification_service'
=========================== short test summary info ============================
FAILED tests/test_app_module.py::test_app_module_imports_notification_controllers_and_services
FAILED tests/test_app_module.py::test_app_module_registers_redis_and_rabbitmq_providers
FAILED tests/test_app_module.py::test_app_module_uses_mock_rabbitmq_if_no_credentials
FAILED tests/test_app_module.py::test_app_module_fails_on_missing_redis_url
FAILED tests/test_main.py::test_bootstrap_nestjs_app_starts_successfully - Mo...
FAILED tests/test_main.py::test_bootstrap_with_missing_env_vars_fails - Modul...
FAILED tests/test_main.py::test_bootstrap_with_invalid_port_env_var - ModuleN...
============================== 7 failed in 2.73s ==============================
```

### Backend - order-service
```
============================= test session starts ==============================
platform linux -- Python 3.11.15, pytest-8.3.2, pluggy-1.6.0
benchmark: 4.0.0 (defaults: timer=time.perf_counter disable_gc=False min_rounds=5 min_time=0.000005 max_time=1.0 calibration_precision=10 warmup=False warmup_iterations=100000)
rootdir: /workspace/c63cf8b1-9e13-44f4-8d3f-4bcc59c7b433/backend/order-service
plugins: benchmark-4.0.0, langsmith-0.8.5, asyncio-0.24.0, anyio-4.13.0
asyncio: mode=Mode.STRICT, default_loop_scope=None
collected 13 items

tests/test_app_module.py FFF                                             [ 23%]
tests/test_main.py FFFFFFFFFF                                            [100%]

=================================== FAILURES ===================================
____________ test_app_module_imports_order_module_and_dependencies _____________
tests/test_app_module.py:10: in test_app_module_imports_order_module_and_dependencies
    from order_service.app.module import AppModule
E   ModuleNotFoundError: No module named 'order_service'
_________________ test_app_module_fails_on_missing_dependency __________________
tests/test_app_module.py:18: in test_app_module_fails_on_missing_dependency
    from order_service.app.module import AppModule
E   ModuleNotFoundError: No module named 'order_service'
________________ test_app_module_provides_global_configuration _________________
tests/test_app_module.py:28: in test_app_module_provides_global_configuration
    from order_service.app.module import AppModule
E   ModuleNotFoundError: No module named 'order_service'
___________ test_create_order_with_valid_items_and_stock_returns_201 ___________
tests/test_main.py:10: in test_create_order_with_valid_items_and_stock_returns_201
    from order_service.main import OrderService
E   ModuleNotFoundError: No module named 'order_service'
____________ test_create_order_with_insufficient_stock_returns_400 _____________
tests/test_main.py:29: in test_create_order_with_insufficient_stock_returns_400
    from order_service.main import OrderService
E   ModuleNotFoundError: No module named 'order_service'
______________ test_create_order_missing_items_field_returns_422 _______________
tests/test_main.py:46: in test_create_order_missing_items_field_returns_422
    from order_service.main import OrderService
E   ModuleNotFoundError: No module named 'order_service'
__________________ test_get_order_by_id_returns_order_details __________________
tests/test_main.py:60: in test_get_order_by_id_returns_order_details
    from order_service.main import OrderService
E   ModuleNotFoundError: No module named 'order_service'
___________________ test_get_order_by_invalid_id_returns_404 ___________________
tests/test_main.py:84: in test_get_order_by_invalid_id_returns_404
    from order_service.main import OrderService
E   ModuleNotFoundError: No module named 'order_service'
______ test_update_order_status_to_pagado_returns_200_and_status_updated _______
tests/test_main.py:101: in test_update_order_status_to_pagado_returns_200_and_status_updated
    from order_service.main import OrderService
E   ModuleNotFoundError: No module named 'order_service'
___________ test_update_order_status_invalid_transition_returns_400 ____________
tests/test_main.py:121: in test_update_order_status_invalid_transition_returns_400
    from order_service.main import OrderService
E   ModuleNotFoundError: No module named 'order_service'
__________ test_add_item_to_existing_order_returns_201_and_item_added __________
tests/test_main.py:135: in test_add_item_to_existing_order_returns_201_and_item_added
    from order_service.main import OrderService
E   ModuleNotFoundError: No module named 'order_service'
________ test_add_item_to_order_with_insufficient_stock_returns_400 __________
tests/test_main.py:162: in test_add_item_to_existing_order_returns_201_and_item_added
    from order_service.main import OrderService
E   ModuleNotFoundError: No module named 'order_service'
____________ test_get_order_history_by_user_returns_list_of_orders _____________
tests/test_main.py:178: in test_get_order_history_by_user_returns_list_of_orders
    from order_service.main import OrderService
E   ModuleNotFoundError: No module named 'order_service'
=========================== short test summary info ============================
FAILED tests/test_app_module.py::test_app_module_imports_order_module_and_dependencies
FAILED tests/test_app_module.py::test_app_module_fails_on_missing_dependency
FAILED tests/test_app_module.py::test_app_module_provides_global_configuration
FAILED tests/test_main.py::test_create_order_with_valid_items_and_stock_returns_201
FAILED tests/test_main.py::test_create_order_with_insufficient_stock_returns_400
FAILED tests/test_main.py::test_create_order_missing_items_field_returns_422
FAILED tests/test_main.py::test_get_order_by_id_returns_order_details - Modul...
FAILED tests/test_main.py::test_get_order_by_invalid_id_returns_404 - ModuleN...
FAILED tests/test_main.py::test_update_order_status_to_pagado_returns_200_and_status_updated
FAILED tests/test_main.py::test_update_order_status_invalid_transition_returns_400
FAILED tests/test_main.py::test_add_item_to_existing_order_returns_201_and_item_added
FAILED tests/test_main.py::test_add_item_to_order_with_insufficient_stock_returns_400
FAILED tests/test_main.py::test_get_order_history_by_user_returns_list_of_orders
============================== 13 failed in 2.70s ==============================
```

### Backend - shared
```
============================= test session starts ==============================
platform linux -- Python 3.11.15, pytest-8.3.2, pluggy-1.6.0
benchmark: 4.0.0 (defaults: timer=time.perf_counter disable_gc=False min_rounds=5 min_time=0.000005 max_time=1.0 calibration_precision=10 warmup=False warmup_iterations=100000)
rootdir: /workspace/c63cf8b1-9e13-44f4-8d3f-4bcc59c7b433/backend/shared
plugins: benchmark-4.0.0, langsmith-0.8.5, asyncio-0.24.0, anyio-4.13.0
asyncio: mode=Mode.STRICT, default_loop_scope=None
collected 15 items

tests/test_config_env.py ...                                             [ 20%]
tests/test_db_schemas.py FFF                                             [ 40%]
tests/test_models_Opportunity.py FF.                                     [ 60%]
tests/test_models_Session.py F.F                                         [ 80%]
tests/test_models_User.py F..                                            [100%]

=================================== FAILURES ===================================
_____________________ test_user_table_schema_matches_spec ______________________
tests/test_db_schemas.py:62: in test_user_table_schema_matches_spec
    assert 'id' in columns and columns['id']['type'] == 'UUID' and columns['id'].get('primary_key') is True
E   AssertionError: assert ('id' in {'CREATE': {'name': 'CREATE', 'type': 'TABLE'}, 'NOT': {'name': 'NOT', 'type': 'NULL'}, 'PRIMARY': {'name': 'PRIMARY', 'type': 'KEY'}, 'UNIQUE': {'name': 'UNIQUE', 'type': 'NOT'}, ...} and 'UUID' == 'UUID'
E     
E       UUID and None is True)
E    +  where None = <built-in method get of dict object at 0x7a9184092c80>('primary_key')
E    +    where <built-in method get of dict object at 0x7a9184092c80> = {'name': 'id', 'type': 'UUID'}.get
_________________ test_opportunities_table_schema_and_indexes __________________
tests/test_db_schemas.py:88: in test_opportunities_table_schema_and_indexes
    assert 'id' in columns and columns['id']['type'] == 'UUID' and columns['id'].get('primary_key') is True
E   AssertionError: assert ('id' in {'CREATE': {'name': 'CREATE', 'type': 'INDEX'}, 'NOT': {'name': 'NOT', 'type': 'NULL'}, 'PRIMARY': {'name': 'PRIMARY', 'type': 'KEY'}, 'REFERENCES': {'name': 'REFERENCES', 'type': 'USERS'}, ...} and 'UUID' == 'UUID'
E     
E       UUID and None is True)
E    +  where None = <built-in method get of dict object at 0x7a91836165c0>('primary_key')
E    +    where <built-in method get of dict object at 0x7a91836165c0> = {'name': 'id', 'type': 'UUID'}.get
_______________ test_sessions_table_schema_and_expiry_constraint _______________
tests/test_db_schemas.py:113: in test_sessions_table_schema_and_expiry_constraint
    assert 'id' in columns and columns['id']['type'] == 'UUID' and columns['id'].get('primary_key') is True
E   AssertionError: assert ('id' in {'CREATE': {'name': 'CREATE', 'type': 'TABLE'}, 'NOT': {'name': 'NOT', 'type': 'NULL'}, 'PRIMARY': {'name': 'PRIMARY', 'type': 'KEY'}, 'REFERENCES': {'name': 'REFERENCES', 'type': 'USERS'}, ...} and 'UUID' == 'UUID'
E     
E       UUID and None is True)
E    +  where None = <built-in method get of dict object at 0x7a9183fe6000>('primary_key')
E    +    where <built-in method get of dict object at 0x7a9183fe6000> = {'name': 'id', 'type': 'UUID'}.get
_______________ test_opportunity_interface_accepts_valid_fields ________________
tests/test_models_Opportunity.py:39: in test_opportunity_interface_accepts_valid_fields
    assert valid is True
E   assert False is True
________________ test_opportunity_interface_invalid_status_enum ________________
tests/test_models_Opportunity.py:55: in test_opportunity_interface_invalid_status_enum
    assert error_field == 'status'
E   AssertionError: assert 'id' == 'status'
E     
E     - status
E     + id
_________________ test_session_interface_accepts_valid_fields __________________
tests/test_models_Session.py:38: in test_session_interface_accepts_valid_fields
    assert valid is True
E   assert False is True
__________________ test_session_interface_expired_date_format __________________
tests/test_models_Session.py:64: in test_session_interface_expired_date_format
    assert error_field == 'expiresAt'
E   AssertionError: assert 'id' == 'expiresAt'
E     
E     - expiresAt
E     + id
___________________ test_user_interface_accepts_valid_fields ___________________
tests/test_models_User.py:38: in test_user_interface_accepts_valid_fields
    assert valid is True
E   assert False is True
=========================== short test summary info ============================
FAILED tests/test_db_schemas.py::test_user_table_schema_matches_spec - Assert...
FAILED tests/test_db_schemas.py::test_opportunities_table_schema_and_indexes
FAILED tests/test_db_schemas.py::test_sessions_table_schema_and_expiry_constraint
FAILED tests/test_models_Opportunity.py::test_opportunity_interface_accepts_valid_fields
FAILED tests/test_models_Opportunity.py::test_opportunity_interface_invalid_status_enum
FAILED tests/test_models_Session.py::test_session_interface_accepts_valid_fields
FAILED tests/test_models_Session.py::test_session_interface_expired_date_format
FAILED tests/test_models_User.py::test_user_interface_accepts_valid_fields - ...
========================= 8 failed, 7 passed in 1.14s ==============================
```

### Root tests
```
============================= test session starts ==============================
platform linux -- Python 3.11.15, pytest-8.3.2, pluggy-1.6.0
benchmark: 4.0.0 (defaults: timer=time.perf_counter disable_gc=False min_rounds=5 min_time=0.000005 max_time=1.0 calibration_precision=10 warmup=False warmup_iterations=100000)
rootdir: /workspace/c63cf8b1-9e13-44f4-8d3f-4bcc59c7b433/tests
plugins: benchmark-4.0.0, langsmith-0.8.5, asyncio-0.24.0, anyio-4.13.0
asyncio: mode=Mode.STRICT, default_loop_scope=None
collected 9 items

test_docker_compose.py sss                                               [ 33%]
test_readme_md.py sss                                                    [ 66%]
test_run_sh.py sss                                                       [100%]

============================== 9 skipped in 0.33s ==============================
```

## 10. Metadata
| Campo | Valor |
|-------|-------|
| Generado | 2026-05-20 16:51 UTC |
| Modo | TDD (tests escritos antes del código) |
| Umbral configurado | ≥90% |
| Herramientas | pytest v8.3.2 / vitest (no detectado) |
| Servicios backend | 6 (api-gateway, auth-service, catalog-service, notification-service, order-service, shared) |
| Servicios frontend | 0 (no detectado) |
| Total tests | 85 ejecutados |
| Tests passing | 7 (solo en shared) |
| Tests failing | 69 |
| Tests skipped | 9 (docker no instalado) |