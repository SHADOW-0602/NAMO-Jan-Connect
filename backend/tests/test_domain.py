import pytest

from backend.src.domain import CATEGORIES, TRANSITIONS, image_extension, make_password_hash, normalize_phone, token_hash, valid_email, verify_password


def test_all_department_portals_are_unique():
    assert set(CATEGORIES) == {"civic_infra", "health_edu", "law_order", "transport", "employment_welfare"}
    portal_ids = [item["portal_id"] for item in CATEGORIES.values()]
    assert len(portal_ids) == len(set(portal_ids)) == 5


def test_status_transitions_are_restricted():
    assert "resolved" in TRANSITIONS["in_progress"]
    assert "resolved" not in TRANSITIONS["submitted"]


def test_contact_validation_and_hashing():
    assert normalize_phone("+91 98765-43210") == "+919876543210"
    assert valid_email("citizen@example.com")
    assert token_hash("secret") == token_hash("secret")
    assert token_hash("secret") != token_hash("other")


def test_upload_types_are_limited():
    assert image_extension("image/webp") == ".webp"
    with pytest.raises(ValueError):
        image_extension("image/svg+xml")


def test_department_passwords_are_salted_and_verified():
    salt_one, hash_one = make_password_hash("Civic-Portal-Password-2026")
    salt_two, hash_two = make_password_hash("Civic-Portal-Password-2026")
    assert salt_one != salt_two
    assert hash_one != hash_two
    assert verify_password("Civic-Portal-Password-2026", salt_one, hash_one)
    assert not verify_password("Wrong-Portal-Password", salt_one, hash_one)
    with pytest.raises(ValueError):
        make_password_hash("too-short")
