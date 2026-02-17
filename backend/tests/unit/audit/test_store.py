from app.audit.store import AuditStore


def test_audit_store_appends_jsonl_entries(tmp_path) -> None:
    store = AuditStore(data_dir=tmp_path)

    entry = store.append(
        actor="system",
        action="gateway.start",
        trace_id="trace_1",
        data={"status": "ok"},
    )
    stored_entries = store.read_all()

    assert entry.audit_id.startswith("audit_")
    assert len(stored_entries) == 1
    assert stored_entries[0]["action"] == "gateway.start"
    assert stored_entries[0]["data"] == {"status": "ok"}
