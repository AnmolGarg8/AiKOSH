# AiKOSH Integration Readiness: Government System Synchronization

This folder contains verification scripts and logs for pushing/pulling commercial datasets to external government bodies (e.g. Ministry of MSME Udyam Registration portal, National AYUSH Health MIS portal, or the ONDC network registry).

## Mock Webhook Specification
* **Endpoint**: `/api/v1/integrations/gov-system-sync`
* **Method**: `POST`
* **Authentication**: Bearer JWT (JSON Web Token)
* **Payload Structure (Pydantic Model)**:
  ```json
  {
    "system_source": "Udyam",
    "sync_type": "push",
    "record_count": 1,
    "data": {
      "udyam_number": "UDYAM-KR-03-009218",
      "enterprise_name": "Ramesh Textiles Ltd",
      "activity_type": "textiles",
      "location": "Karnataka"
    }
  }
  ```

---

## Production Integration Requirements

To move this stub into a production environment, the following engineering standards are required:

### 1. Authentication & Security
* **Protocol**: OAuth2 Mutual TLS (mTLS) is standard for secure inter-ministry API gateway traffic.
* **Credentials**: APIs must be routed via National Informatics Centre (NIC) API Gateways utilizing API keys matched with JWT bearer tokens.
* **IP Whitelisting**: Strict firewalls restricting incoming synchronization requests to pre-registered NIC IP blocks.

### 2. Data Formats
* **Standardization**: JSON structure aligned with India's National Data Sharing and Accessibility Policy (NDSAP) schema definitions.
* **Encryption**: Confidential profile attributes must be encrypted at the payload level using AES-256-GCM.

### 3. Frequency & Backoff
* **Method**: Asynchronous queue-based sync (Celery or RabbitMQ) scheduled daily at low-peak periods (e.g. 02:00 IST).
* **Retry Strategy**: Exponential backoff (retry after 2s, 4s, 8s, 16s, etc.) up to 5 attempts to prevent API overloading.
