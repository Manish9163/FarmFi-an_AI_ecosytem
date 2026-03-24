from flask import Blueprint, request, jsonify, g
from services.credit_service import CreditService
from utils.auth_middleware import token_required, role_required

credit_bp = Blueprint('credit', __name__)
credit_service = CreditService()


@credit_bp.route('/account', methods=['GET'])
@token_required
@role_required('Farmer')
def get_account():
    acc = credit_service.get_account(g.current_user['id'])
    if not acc:
        return jsonify({'error': 'No credit account found'}), 404
    return jsonify(acc), 200


@credit_bp.route('/repay', methods=['POST'])
@token_required
@role_required('Farmer')
def repay():
    data = request.get_json(silent=True) or {}
    amount = data.get('amount')
    if not amount or float(amount) <= 0:
        return jsonify({'error': 'Valid repayment amount required'}), 400
    result = credit_service.repay(g.current_user['id'], float(amount))
    if not result['success']:
        return jsonify({'error': result['error']}), 400
    return jsonify(result), 200


@credit_bp.route('/transactions', methods=['GET'])
@token_required
@role_required('Farmer')
def transactions():
    return jsonify(credit_service.get_transactions(g.current_user['id'])), 200
